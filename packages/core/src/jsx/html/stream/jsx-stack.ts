import { Readable, ReadableOptions } from "stream";
import { JSXToHTMLUtils } from "../jsx-to-html";
import {
    isTextNode,
    isClassNode,
    isFunctionNode,
    isPromise,
    isStaticNode,
    unwrapFragments,
} from "../jsx-utils";
import {
    ContextManager,
    SXLElementWithContext,
    isAsyncElementWithContext,
} from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "@sxl/core/src/types/context";
import {
    decorateContext,
    wirePlaceholder,
} from "@/jsx/context/context-decorator";

class SubStack {
    doneList: string[] = [];
    inProgressStack: Array<SXL.StaticElement | string> = [];

    merge(another: SubStack) {
        this.doneList = [...this.doneList, ...another.doneList];
        this.inProgressStack = [
            ...this.inProgressStack,
            ...another.inProgressStack,
        ];
    }
}

interface JSXStackOptions {
    sync: boolean;
}

const MARKERS = {
    ASYNC_START: "ASYNC_START",
    ASYNC_END: "ASYNC_END",
    END: "END",
};

const REQUEUED = "REQUEUED";

type JSXStackEvents = keyof typeof MARKERS;
type JSXStackEventMap = {
    [K in JSXStackEvents]?: Array<() => void>;
};

function isEventKey(str: string): str is JSXStackEvents {
    return !!MARKERS[str];
}

export class JSXStack<G extends SXLGlobalContext> {
    options: JSXStackOptions;
    doneList: string[] = [];
    inProgressStack: Array<SXL.StaticElement | string> = [];
    eventListeners: JSXStackEventMap = {};

    asyncInProgress: Promise<void>[] = [];
    private contextManager: ContextManager<G>;

    constructor(globalContext: G, options?: JSXStackOptions) {
        this.contextManager = new ContextManager(globalContext, {
            sync: options?.sync ?? false,
        });
        this.options = options ?? { sync: false };
    }

    on(ev: JSXStackEvents, callback: () => void) {
        this.eventListeners[ev] = this.eventListeners[ev] ?? [];
        this.eventListeners[ev]?.push(callback);
    }

    fire(ev: JSXStackEvents) {
        this.eventListeners[ev]?.forEach((cb) => cb());
    }

    private wrap(element: SXL.StaticElement): SXLElementWithContext {
        if (isFunctionNode(element)) {
            return this.contextManager.fromFunction(element);
        } else if (isClassNode(element)) {
            return this.contextManager.fromClass(element);
        } else {
            return this.contextManager.fromStaticElement(element);
        }
    }

    processElementInSubqueue(element: SXL.StaticElement) {
        const localStack = new SubStack();
        // TODO: Find a better place to clean fragments
        if (isStaticNode(element) && element.type === "fragment") {
            element.children
                .reverse()
                .forEach((child) => localStack.inProgressStack.push(child));
            return;
        }

        const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(element);

        if (!element.props.id) {
            throw new Error("Resolved async element should have an ID");
        }

        localStack.inProgressStack.push(MARKERS.ASYNC_END);
        localStack.inProgressStack.push(wirePlaceholder(element.props.id));
        localStack.inProgressStack.push(close);
        element.children.reverse().forEach((child) => {
            localStack.inProgressStack.push(child);
        });

        localStack.inProgressStack.push(open);
        localStack.inProgressStack.push(MARKERS.ASYNC_START);

        this.mergeSubstack(localStack);
    }

    async processElement(
        element: SXL.StaticElement,
        wrap: SXLElementWithContext
    ) {
        // TODO: Find a better place to clean fragments
        if (isStaticNode(element) && element.type === "fragment") {
            element.children
                .reverse()
                .forEach((child) => this.inProgressStack.push(child));
            return;
        }

        if (isFunctionNode(element) || isClassNode(element)) {
            await this.push(element);
            // this.doneList.push("REQUEUED");
            return;
        }

        const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(element);
        this.doneList.push(open);
        const jsCode = decorateContext(wrap);
        if (jsCode.trim().length > 0) {
            this.inProgressStack.push(jsCode);
        }
        this.inProgressStack.push(close);
        element.children.reverse().forEach((child) => {
            this.inProgressStack.push(child);
        });
    }

    async push(element: string | SXL.Element) {
        if (isTextNode(element)) {
            this.doneList.push(element);
        } else if (isPromise(element)) {
            if (this.options.sync) {
                await this.push(await element);
                return;
            }

            const p = element.then((e) => {
                queueMicrotask(() => {
                    const currentPromise = this.asyncInProgress.indexOf(p);
                    this.asyncInProgress.splice(currentPromise, 1);
                });
                this.processElementInSubqueue(e);
            });

            this.asyncInProgress.push(p);
        } else if (isStaticNode(element) && element.type === "fragment") {
            const children = unwrapFragments(element);
            children
                .reverse()
                .forEach((child) => this.inProgressStack.push(child));
        } else {
            const wrapped = this.wrap(element);

            if (wrapped.placeholder && !this.options.sync) {
                await this.processElement(wrapped.placeholder, wrapped);
            }

            if (isAsyncElementWithContext(wrapped)) {
                await this.push(wrapped.element.promise);
            } else {
                await this.processElement(wrapped.element, wrapped);
            }
        }
    }

    mergeSubstack(subStack: SubStack) {
        this.doneList = [...this.doneList, ...subStack.doneList];
        this.inProgressStack = [
            ...subStack.inProgressStack,
            ...this.inProgressStack,
        ];
    }

    async pop(): Promise<string | undefined> {
        if (
            this.inProgressStack.length === 0 &&
            this.asyncInProgress.length > 0
        ) {
            await Promise.race(this.asyncInProgress);
        }

        let next = this.inProgressStack.pop();
        while (typeof next === "string" && isEventKey(next)) {
            this.fire(next);
            next = this.inProgressStack.pop();
        }
        if (next) {
            await this.push(next);
        }

        // The previous push may have found just function elements
        // that were resolved and requeued, which means doneList will be empty
        // but the inProgress stacks will have elements.
        if (
            this.doneList.length === 0 &&
            (this.inProgressStack.length > 0 || this.asyncInProgress.length > 0)
        ) {
            return await this.pop();
        }

        const last = this.doneList.shift();
        if (!last) {
            this.fire("END");
        }

        return last;
    }
}

interface AdditionalChunks {
    pre: string[];
    post: string[];
    sync?: boolean;
}

export class JSXStream<G extends SXLGlobalContext> extends Readable {
    private root: SXL.Element;
    private jsxStack: JSXStack<G>;
    private pre: string[];
    private post: string[];

    constructor(
        root: SXL.Element,
        globalContext: G,
        options?: Partial<ReadableOptions> & AdditionalChunks
    ) {
        super({ ...options, encoding: "utf-8" });
        this.pre = options?.pre ?? [];
        this.post = options?.post ?? [];
        this.root = root;
        this.jsxStack = new JSXStack(globalContext, {
            sync: options?.sync ?? false,
        });
    }

    async init() {
        await this.jsxStack.push(this.root);
    }

    _read(): void {
        if (this.pre.length) {
            this.push(this.pre.shift());
            return;
        }
        void this.jsxStack.pop().then((chunk) => {
            if (!chunk) {
                this.post.forEach((ch) => {
                    this.push(ch);
                });

                this.push(null);
            }

            this.push(chunk);
        });
    }
}
