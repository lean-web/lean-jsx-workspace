import { Readable, ReadableOptions } from "stream";
import { RenderOptions } from "./stream-api";
import { JSXStream } from "./jsx-stack";

export function getHTMLStreamFromJSX(
    root: SXL.Element,
    htmlTemplate: [string, string],
    options?: ReadableOptions & RenderOptions
): Readable {
    const { jsDisabled, ..._opts } = options ?? {};
    const [start, end] = htmlTemplate;

    return new JSXStream(
        root,
        { username: "" },
        { pre: [start], post: [end], sync: jsDisabled ?? false }
    );
}
