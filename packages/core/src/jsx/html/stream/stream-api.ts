import { ReadableOptions } from "stream";

export interface JSXStream {
    onStart(): void;
    onEnd(): void;
    onOpenTag(): void;
    onCloseTag(): void;
}

export interface RenderOptions {
    jsDisabled: boolean;
}

export type JSXStreamOptions = ReadableOptions & RenderOptions;
