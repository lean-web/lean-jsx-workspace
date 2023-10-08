import { ContextFactory } from "../context";
import { AsyncChunk } from "./stream-utils/async-chunk";

export class AsyncManager {
    private contextFactory: ContextFactory;
    asyncQueue: AsyncChunk[] = [];

    constructor(contextFactory: ContextFactory) {
        this.contextFactory = contextFactory;
    }

    handle(
        chunk: SXL.AsyncElement,
        placehoder?: SXL.StaticElement
    ): SXL.StaticElement {
        const asyncChunk = new AsyncChunk(
            this.contextFactory.buildPlaceholderId(),
            chunk,
            placehoder
        );
        this.asyncQueue.push(asyncChunk);
        return asyncChunk.placeholder;
    }
}
