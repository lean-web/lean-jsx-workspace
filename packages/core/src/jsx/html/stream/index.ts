import { Readable, ReadableOptions } from "stream";
import { ContextFactory } from "../context";
import { RenderOptions } from "./stream-api";

import { JSXStream } from "./jsx-stack";

export function getHTMLStreamFromJSX(
    root: SXL.Element,
    contextFactory: ContextFactory,
    htmlTemplate: [string, string],
    options?: ReadableOptions & RenderOptions
): Readable {
    const { jsDisabled, ...opts } = options ?? {};
    const [start, end] = htmlTemplate;

    return new JSXStream(
        root,
        { username: "" },
        { pre: [start], post: [end], sync: jsDisabled ?? false }
    );
}
