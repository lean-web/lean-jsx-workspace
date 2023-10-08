import { Readable, ReadableOptions } from "stream";
import { ContextFactory } from "../context";
import { JSXToHTMLUtils } from "../jsx-to-html";
import {
    isTextNode,
    isClassNode,
    isFunctionNode,
    isPromise,
} from "../jsx-utils";
import { AsyncChunk } from "./stream-utils/async-chunk";
import { mergeProps } from "./stream-utils/merge-props";
import { JSXStreamOptions } from "./stream-api";

interface HandleElementOptions {
    maybePlaceholder?: SXL.StaticElement;
    insideAsyncResponse?: boolean;
}

export class AsynJSXStream extends Readable {
    private root: JSX.Element;
    private contextFactory: ContextFactory;
    private asyncQueue: AsyncChunk[] = [];
    private called: boolean = false;
    private jsDisabled = false;
    private head: string[] = [];
    private tail: string[] = [];

    constructor(
        root: SXL.Element,
        contextFactory: ContextFactory,
        head: string[],
        tail: string[],
        options?: ReadableOptions
    ) {
        super({ ...options, encoding: "utf-8" });
        this.contextFactory = contextFactory;
        this.root = root;
        this.head = head;
        this.tail = tail;
    }

    _read(_size: number): void {
        if (!this.called) {
            this.called = true;
            this.head.forEach((chunk) => chunk.length > 0 && this.push(chunk));
            this.handleElement(this.root, {});
            queueMicrotask(() => {
                void this.flushAsyncQueue();
            });
        }
    }

    /**
     * Handle Promise<JSX.Element> elements.
     * @param chunk
     * @param loading
     */
    handleAsyncElement(chunk: SXL.AsyncElement, loading?: SXL.StaticElement) {
        const asyncChunk = new AsyncChunk(
            this.contextFactory.buildPlaceholderId(),
            chunk,
            loading
        );
        this.handlePlaceholder(asyncChunk.placeholder);
        this.asyncQueue.push(asyncChunk);
    }

    handleClassElement(classNode: SXL.ClassElement) {
        const loading = classNode.render();
        this.handleAsyncElement(
            Promise.resolve(classNode.renderLazy()),
            loading
        );
    }

    handlePlaceholder(element: SXL.StaticElement) {
        this.handleElement(element, {});
    }

    handleStaticElement(
        chunk: SXL.StaticElement | string,
        maybePlaceholder?: SXL.StaticElement
    ) {
        if (isTextNode(chunk)) {
            this.push(chunk);
        } else if (isClassNode(chunk)) {
            const classNode = new chunk.type({
                ...chunk.props,
                children: chunk.children,
                globalContext: this.contextFactory.globalContext,
            });
            this.handleClassElement(classNode);
        } else if (isFunctionNode(chunk)) {
            const localCtx = this.contextFactory.newContext();
            const newElement = chunk.type.bind(localCtx)({
                ...chunk.props,
                children: chunk.children,
                globalContext: this.contextFactory.globalContext,
            });

            this.handleElement(localCtx.decorate(newElement), {
                maybePlaceholder,
            });
        } else {
            if (!chunk.ctx) {
                const localCtx = this.contextFactory.newContext();
                chunk = localCtx.decorate(chunk) as SXL.StaticElement;
            }

            if (chunk.type === "fragment") {
                chunk.children.forEach((child) => {
                    if (typeof child !== "string") {
                        child.props = {
                            ...child.props,
                            ...mergeProps(chunk as SXL.StaticElement, child),
                        };
                    }

                    this.handleStaticElement(child);
                });
                return;
            }

            const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(chunk);
            this.push(open);
            for (const child of chunk.children) {
                this.handleStaticElement(child);
            }

            this.push(close);
            if (chunk.ctx) {
                this.push(chunk.ctx.toSource());
            }
            this.scheduleAsyncRender();
        }
    }

    handleElement(
        chunk: SXL.Element,
        { maybePlaceholder }: HandleElementOptions
    ): void {
        if (!chunk) {
            // Do nothing
        } else if (isPromise(chunk)) {
            this.handleAsyncElement(chunk, maybePlaceholder);
        } else {
            this.handleStaticElement(chunk, maybePlaceholder);
        }
    }

    get pendingAsyncChunks() {
        return this.asyncQueue.filter(
            (q) => q.element.isFulfilled() && !q.processed
        );
    }

    handleNextAvailableAsync() {
        let handed = 0;
        this.pendingAsyncChunks.forEach((asyncElement) => {
            if (asyncElement.element.isFulfilled()) {
                handed++;
                this.handleElement(asyncElement.element.value, {
                    insideAsyncResponse: true,
                });

                this.push(asyncElement.jsWiring);
                asyncElement.processed = true;
            }
        });
        return handed;
    }

    scheduleAsyncRender() {
        queueMicrotask(() => {
            this.handleNextAvailableAsync();
        });
    }

    flushAsyncQueue() {
        const interval = setInterval(() => {
            const pending = this.asyncQueue.filter(
                (q) => !q.element.isFulfilled() || !q.processed
            );
            if (pending.length === 0) {
                clearInterval(interval);
                this.tail.forEach(
                    (chunk) => chunk.length > 0 && this.push(chunk)
                );
                this.push(null);
            }
            pending.forEach((asyncElement) => {
                if (asyncElement.element.isFulfilled()) {
                    this.handleElement(asyncElement.element.value, {
                        insideAsyncResponse: true,
                    });

                    this.push(asyncElement.jsWiring);
                    asyncElement.processed = true;
                }
            });
        }, 200);

        // while (pending.length) {
        //   const el = pending.shift();
        //   if (el) {
        //     const element = await el.element.promise;
        //     this.handleElement(element);
        //     this.push(el.jsWiring);
        //   }
        // }
    }
}
