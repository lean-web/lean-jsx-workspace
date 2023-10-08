import { Readable, ReadableOptions } from "stream";
import { ContextFactory } from "../context";
import { JSXToHTMLUtils } from "../jsx-to-html";
import {
    isClassNode,
    isFunctionNode,
    isPromise,
    isTextNode,
} from "../jsx-utils";
import { mergeProps } from "./stream-utils/merge-props";
import { JSXStreamOptions } from "./stream-api";

export class SynJSXStream extends Readable {
    private root: JSX.Element;
    private contextFactory: ContextFactory;
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
        this.contextFactory = contextFactory;
        this.head = head;
        this.tail = tail;
    }

    _read(_size: number): void {
        if (!this.called) {
            this.called = true;
            this.head.forEach((chunk) => chunk.length > 0 && this.push(chunk));
            void this.handleElementNoJS(this.root).then(() => {
                this.tail.forEach(
                    (chunk) => chunk.length > 0 && this.push(chunk)
                );
                this.push(null);
            });
        }
    }

    async handleElementNoJS(chunk: SXL.Element | string) {
        if (isPromise(chunk)) {
            await this.handleElementNoJS(await chunk);
        } else if (isTextNode(chunk)) {
            this.push(chunk);
        } else if (isClassNode(chunk)) {
            const classNode = new chunk.type({
                ...chunk.props,
                children: chunk.children,
                globalContext: this.contextFactory.globalContext,
            });
            await this.handleElementNoJS(await classNode.renderLazy());
        } else if (isFunctionNode(chunk)) {
            const localCtx = this.contextFactory.newContext();
            const newElement = await chunk.type.bind(localCtx)({
                ...chunk.props,
                children: chunk.children,
                globalContext: this.contextFactory.globalContext,
            });

            await this.handleElementNoJS(newElement);
        } else {
            if (chunk.type === "fragment") {
                const fragmentChildren = chunk.children.map(async (child) => {
                    if (typeof child !== "string") {
                        child.props = {
                            ...child.props,
                            ...mergeProps(chunk, child),
                        };
                    }

                    await this.handleElementNoJS(child);
                });
                await Promise.all(fragmentChildren);
                return;
            }

            const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(chunk);

            this.push(open);
            for (const child of chunk.children) {
                await this.handleElementNoJS(child);
            }

            this.push(close);
        }
    }
}
