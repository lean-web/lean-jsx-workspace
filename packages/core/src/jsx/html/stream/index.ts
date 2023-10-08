import { Readable, ReadableOptions } from "stream";
import { ContextFactory } from "../context";
import { RenderOptions } from "./stream-api";
import { SynJSXStream } from "./syn-jsx-stream";
import { AsynJSXStream } from "./async-jsx-stream";

export function getHTMLStreamFromJSX(
    root: SXL.Element,
    contextFactory: ContextFactory,
    htmlTemplate: [string, string],
    options?: ReadableOptions & RenderOptions
): Readable {
    const { jsDisabled, ...opts } = options ?? {};
    const [start, end] = htmlTemplate;

    if (jsDisabled) {
        return new SynJSXStream(root, contextFactory, [start], [end], {
            ...opts,
            encoding: "utf8",
        });
    }

    return new AsynJSXStream(root, contextFactory, [start], [end], {
        ...opts,
        encoding: "utf8",
    });
}
