import { JSDOM } from "jsdom";
import { readableToString } from "./test-utils";
import { ContextFactory } from "@/jsx/html/context";
import { AsynJSXStream } from "@/jsx/html/stream/async-jsx-stream";

export class TestJSXStream extends AsynJSXStream {
    reachedStaticEnd = false;
    flushed = false;
    content: string = "";
    flushes: string[] = [];

    override scheduleAsyncRender() {
        queueMicrotask(() => {
            const handled = super.handleNextAvailableAsync();
            if (handled) {
                this.flushes.push(this.content);
            }
        });
    }

    override push(chunk: any, encoding?: BufferEncoding | undefined): boolean {
        this.content += chunk;
        return super.push(chunk, encoding);
    }

    override flushAsyncQueue() {
        this.flushes.push(this.content);
        super.flushAsyncQueue();
    }
}

export function stringToDom(data: string): [JSDOM, string[]] {
    const domChanges: string[] = [];
    const dom = new JSDOM(
        `<html>
    <head></head>
    ${data}</html>`,
        {
            runScripts: "dangerously",
            beforeParse(window) {
                const document = window.document;
                window.sxl = {
                    fillPlaceHolder(placeHolderId: string) {
                        const template = document.getElementById(
                            placeHolderId
                        ) as HTMLTemplateElement;
                        const container = document.querySelector(
                            `[data-placeholder="${placeHolderId}"]`
                        );

                        if (!template || !container) {
                            return;
                        }
                        const clone = document.importNode(
                            template.content,
                            true
                        );
                        const maybeNestedTemplate =
                            clone.querySelector("[data-placeholder]");
                        if (maybeNestedTemplate) {
                            while (container.firstChild) {
                                maybeNestedTemplate.appendChild(
                                    container.firstChild
                                );
                            }
                        }

                        container.innerHTML = "";
                        container.removeAttribute(`[data-${placeHolderId}]`);
                        if (container.parentElement) {
                            // if we can, replace the placeholder with the actual element
                            container.parentElement.replaceChild(
                                clone,
                                container
                            );
                        } else {
                            container.appendChild(clone);
                        }
                        domChanges.push(
                            window.document.body.innerHTML.replace(
                                /[ \n]{1,}/g,
                                " "
                            )
                        );
                        // clean-up the template
                        // template.remove();
                    },
                };
            },
        }
    );

    dom.virtualConsole.on("error", (err) => {
        console.error(err);
        throw err;
    });

    dom.virtualConsole.on("log", function (this: unknown, err) {
        console.log(err);
    });

    return [dom, domChanges];
}

export async function jsxToDOMTest(jsx: SXL.Element) {
    const stream = new TestJSXStream(jsx, new ContextFactory(), [""], [""]);

    const content = await readableToString(stream);
    stream.flushes.push(content);

    const doms = stream.flushes
        .map((flush) => stringToDom(flush))
        // TODO: Fix the order of these changes
        .flatMap(([dom, domChanges]) => [domContent(dom), ...domChanges]);

    return doms;
}

export interface Deferred<T> {
    resolve: (arg: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    promise: Promise<T>;
}

export function defer<T>(): Deferred<T> {
    const deferred = {} as Deferred<T>;
    const promise = new Promise<T>(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    deferred.promise = promise;
    return deferred;
}

export function domContent(dom: JSDOM): string {
    return dom.window.document.body.innerHTML.replace(/[ \n]{1,}/g, " ");
}
