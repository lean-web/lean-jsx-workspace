/* eslint-disable @typescript-eslint/no-unsafe-call */
import { SXLGlobalContext } from "@/context";
import { isPromise } from "./jsx-utils";
import { UIDGenerator } from "./uuid";

type ExtendedEventHandlers<Ctx> = {
    [k in keyof GlobalEventHandlers]: GlobalEventHandlers[k] extends
        | ((this: GlobalEventHandlers, ev: infer E) => any)
        | null
        ? (this: ExtendedEventHandlers<Ctx>, ev: E, ctx: Ctx) => any
        : never;
};

type ClientHandler<
    T extends keyof ExtendedEventHandlers<Ctx>,
    Ctx
> = ExtendedEventHandlers<Ctx>[T];

export type ContextType = "eager" | "lazy";

interface ComponentContext<Ctx> {
    getId(): string;

    toSource(): string;

    decorate(vnode: SXL.Element): SXL.Element;
}
export type Context<Ctx extends Record<string, unknown>> = Ctx &
    ComponentContext<Ctx>;

type KeyHandlerTyple<Ctx, T extends keyof ExtendedEventHandlers<Ctx>> = [
    T,
    ClientHandler<keyof ExtendedEventHandlers<Ctx>, Ctx>
];

export interface ContextFactoryOptions {
    prefix?: string;
}

export class ContextFactory {
    opts?: ContextFactoryOptions;
    globalContext?: SXLGlobalContext;

    idGen: (type?: "PROD" | "DEV" | undefined) => string;

    constructor(
        opts?: ContextFactoryOptions,
        globalContext?: SXLGlobalContext
    ) {
        this.idGen = UIDGenerator.new();
        this.opts = opts;
        this.globalContext = globalContext;
    }
    newContext<K extends Record<string, undefined>>() {
        const ctx = new ContextImpl<K>(this.idGen());
        const handler1: ProxyHandler<ContextImpl<K>> = {
            get(target, prop, receiver) {
                // console.log({ prop, target });
                if (prop in target) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return target[prop];
                }
                if (typeof prop === "string") {
                    return target._data[prop];
                }
            },
            set(target, prop, value) {
                if (typeof prop === "string") {
                    target._data[prop] = value;
                    return true;
                }
                return false;
            },
        };

        return new Proxy<ContextImpl<K>>(
            ctx,
            handler1
        ) as unknown as Context<K>;
    }

    buildPlaceholderId(): string {
        const prefix = this.opts?.prefix;
        if (prefix) {
            return `${prefix}-${this.idGen()}`;
        }
        return `placeholder-${this.idGen()}`;
    }
}

export class ContextImpl<Ctx extends Record<string, unknown>>
    implements ComponentContext<Ctx>
{
    private static idGen = UIDGenerator.new();
    private globalContext?: SXLGlobalContext;
    _id: string;
    _handlers: KeyHandlerTyple<Ctx, keyof ExtendedEventHandlers<Ctx>>[] = [];
    _data: Record<string, unknown> = {};

    constructor(id: string, globalContext?: SXLGlobalContext) {
        this._id = id;
        this.globalContext = globalContext;
    }

    getId() {
        return this._id;
    }

    getGlobalContext() {
        return this.globalContext;
    }

    _decorateUnwrappedActions(vnode: SXL.StaticElement) {
        if (!vnode) {
            return;
        }
        const handlers = Object.entries(vnode.props).filter(
            ([key, v]) => /^on/.test(key) || typeof v === "function"
        );

        handlers.forEach(([key, v]) => {
            vnode.props[key] = "";
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            this._handlers.push([
                key as keyof GlobalEventHandlers,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                v?.toString(),
            ]);
        });

        return vnode;
    }

    decorate(vnode: SXL.Element): SXL.Element {
        if (!vnode) {
            return vnode;
        }
        if (isPromise(vnode)) {
            return vnode.then((node) => {
                // if (!vnode) {
                //   return vnode;
                // }
                this._decorateUnwrappedActions(node);
                if (this._handlers.length === 0) {
                    return vnode;
                }
                // const dataset = node.props.dataset ?? {};
                if (node.props.dataset) {
                    node.props.dataset[this._id] = "true";
                }
                // node.props.dataset = dataset;
                // console.log({ asyncCtxBefore: node.ctx });
                node.ctx = this as unknown as Context<
                    Record<string, undefined>
                >;
                // console.log({ asyncCtxAfter: node.ctx });
                return node;
            });
        }
        this._decorateUnwrappedActions(vnode);
        if (this._handlers.length === 0) {
            return vnode;
        }
        const dataset = vnode.props.dataset ?? {};
        dataset[this._id] = "true";
        vnode.props.dataset = dataset;
        vnode.ctx = this as unknown as Context<Record<string, undefined>>;

        return vnode;
    }

    toSource() {
        if (this._handlers.length === 0) {
            return "";
        }
        const handlers = this._handlers
            .map(
                ([ev, h]) =>
                    `document.querySelector('[${
                        this._id
                    }]').addEventListener('${ev.replace(
                        /^on/,
                        ""
                    )}', ${h?.toString()})`
            )
            .join(";\n");
        const fns = Object.entries(this._data)
            // .map((entry) => entry[1])
            .filter(
                (entry): entry is [string, Function] =>
                    typeof entry[1] === "function"
            )
            .map(([key, fn]) => `this.${key} =  ${fn.toString()}`)
            .join("\n");
        const source = `<script>
      (function(){
        ${fns}
        ${handlers}
      }).call(${JSON.stringify(this._data)})
    </script>
  `;
        return source;
    }
}
