import { isPromise, unwrapFragments } from "../html/jsx-utils";
import { UIDGenerator } from "../html/uuid";
import { TrackablePromise } from "../html/stream/stream-utils/trackable-promise";
import { SXLGlobalContext } from "@sxl/core/src/types/context";

interface SyncJSXWrapper {
    id: ContextID;
    element: SXL.StaticElement;
    placeholder: undefined;
    handlers: Array<HandlerPropAndValue>;
    context: SXL.Context<Record<string, unknown>>;
}

interface AsyncJSXWrapper {
    id: ContextID;
    element: TrackablePromise<SXL.StaticElement, unknown>;
    placeholder: SXL.StaticElement;
    handlers: Array<HandlerPropAndValue>;
    context: SXL.Context<Record<string, unknown>>;
}

export type SXLElementWithContext = SyncJSXWrapper | AsyncJSXWrapper;

export function isAsyncElementWithContext(
    element: SXLElementWithContext
): element is AsyncJSXWrapper {
    return (
        element.element instanceof TrackablePromise ||
        isPromise(element.element)
    );
}

export type ContextID = string;

type HandlerPropAndValue = [string, string];

export class LocalContext implements SXL.Context<Record<string, unknown>> {
    [x: string]: unknown;
}

interface ContextManagerOptions {
    sync: boolean;
}

export class ContextManager<G extends SXLGlobalContext> {
    private options: ContextManagerOptions;
    private uiden = UIDGenerator.new();
    private globalContext: G;

    constructor(globalContext: G, options?: ContextManagerOptions) {
        this.globalContext = globalContext;
        this.options = options ?? { sync: false };
    }

    newContext(): SXL.Context<Record<string, unknown>> {
        return new LocalContext();
    }

    fromStaticElement(element: SXL.StaticElement): SXLElementWithContext {
        const id = this.uiden();
        const localCtx = this.newContext();

        return this.processElement(id, localCtx, element);
    }

    fromFunction(element: SXL.FunctionElement): SXLElementWithContext {
        const id = this.uiden();
        const localCtx = this.newContext();

        const newElement = element.type.bind(localCtx)({
            ...element.props,
            children: element.children,
            globalContext: this.globalContext,
        });

        return this.processElement(id, localCtx, newElement);
    }

    fromClass(element: SXL.ClassElement): SXLElementWithContext {
        const id = this.uiden();

        const localCtx = this.newContext();

        const classNode = new element.type({
            ...element.props,
            children: element.children,
            globalContext: this.globalContext,
        });

        return this.processElement(
            id,
            localCtx,
            classNode.renderLazy(),
            classNode.render()
        );
    }

    private processElement(
        id: ContextID,
        context: SXL.Context<Record<string, unknown>>,
        element: SXL.Element,
        placeholder?: SXL.StaticElement
    ): SXLElementWithContext {
        if (isPromise(element)) {
            return {
                id,
                element: new TrackablePromise(
                    element.then((element) => {
                        // if operating in sync mode,
                        // we don't need to wrap the async element
                        // in a template
                        if (this.options.sync) {
                            return element;
                        }
                        if (!element.props.dataset) {
                            element.props.dataset = {};
                        }
                        return {
                            type: "template",
                            props: {
                                id,
                            },
                            children: unwrapFragments(element),
                        };
                    }),
                    id
                ),
                placeholder: this.processPlaceholder(id, placeholder),
                handlers: [],
                context,
            };
        }

        return {
            id,
            element,
            placeholder: undefined,
            handlers: this.processHandlers(id, element),
            context,
        };
    }

    private processHandlers(
        id: ContextID,
        element: SXL.StaticElement
    ): Array<HandlerPropAndValue> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/ban-types
        const handlers: Array<[string, unknown]> = Object.entries(
            element.props
        ).filter(([key, v]) => /^on/.test(key) || typeof v === "function");

        const _handlers: Array<HandlerPropAndValue> = [];

        handlers.forEach(([key, v]) => {
            let handlerContent = "";
            if (typeof v === "function") {
                handlerContent = v.toString();
            } else if (typeof v === "string") {
                handlerContent = v;
            }
            element.props[key] = "";
            _handlers.push([key as keyof GlobalEventHandlers, handlerContent]);
        });

        if (_handlers.length) {
            element.props.dataset = element.props.dataset ?? {};
            element.props.dataset["data-action"] = id;
        }

        return _handlers;
    }

    private processPlaceholder(
        id: ContextID,
        placehoder?: SXL.StaticElement
    ): SXL.StaticElement {
        return {
            type: "div",
            props: {
                dataset: {
                    ["data-placeholder"]: id,
                },
            },
            children: placehoder ? unwrapFragments(placehoder) : [],
        };
    }
}
