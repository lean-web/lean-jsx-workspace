import { AsyncChunk } from "@/jsx/html/stream/stream-utils/async-chunk";
import { describe, expect, test } from "@jest/globals";

describe("AsyncChunk", () => {
    test("Generates async template and empty placehoder", async () => {
        const chunk = new AsyncChunk(
            "123",
            Promise.resolve({
                type: "div",
                props: {},
                children: ["Costly"],
            })
        );

        const fulfilledElement = await chunk.element.promise;

        const placeholderElement = chunk.placeholder;

        expect(fulfilledElement).toStrictEqual({
            type: "template",
            props: {
                id: "123",
            },
            children: [
                {
                    type: "div",
                    props: {
                        dataset: {},
                    },
                    children: ["Costly"],
                },
            ],
        });

        expect(placeholderElement).toStrictEqual({
            type: "div",
            props: {
                dataset: {
                    "data-placeholder": "123",
                },
            },
            children: [],
        });
    });

    test("Generates placehoder with passed arguments", async () => {
        const chunk = new AsyncChunk(
            "123",
            Promise.resolve({
                type: "div",
                props: {
                    dataset: {},
                },
                children: ["Costly"],
            }),
            {
                type: "div",
                props: {
                    dataset: {},
                },
                children: ["Loading"],
            }
        );

        const fulfilledElement = await chunk.element.promise;

        const placeholderElement = chunk.placeholder;

        expect(fulfilledElement).toStrictEqual({
            type: "template",
            props: {
                id: "123",
            },
            children: [
                {
                    type: "div",
                    props: {
                        dataset: {},
                    },
                    children: ["Costly"],
                },
            ],
        });

        expect(placeholderElement).toStrictEqual({
            type: "div",
            props: {
                dataset: {
                    "data-placeholder": "123",
                },
            },
            children: ["Loading"],
        });
    });

    test("Generates placehoder with passed arguments (2)", async () => {
        const factory = () => ({
            type: "div",
            props: {},
            children: ["Loading"],
        });
        const chunk = new AsyncChunk(
            "123",
            Promise.resolve({
                type: "div",
                props: {},
                children: ["Costly"],
            }),
            {
                type: factory,
                props: {},
                children: [],
            }
        );

        const fulfilledElement = await chunk.element.promise;

        const placeholderElement = chunk.placeholder;

        expect(fulfilledElement).toStrictEqual({
            type: "template",
            props: {
                id: "123",
            },
            children: [
                {
                    type: "div",
                    props: {
                        dataset: {},
                    },
                    children: ["Costly"],
                },
            ],
        });

        expect(placeholderElement).toStrictEqual({
            type: "div",
            props: {
                dataset: {
                    "data-placeholder": "123",
                },
            },
            children: ["Loading"],
        });
    });
});
