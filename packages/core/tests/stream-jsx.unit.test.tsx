import { describe, expect, test } from "@jest/globals";
import { ContextFactory } from "@/jsx/html/context";
import sinon from "sinon";
import { Readable } from "stream";

import { readableToString, withSxlStaticElement } from "./test-utils";
import { getHTMLStreamFromJSX } from "@/jsx/html/stream";
import { AsynJSXStream } from "@/jsx/html/stream/async-jsx-stream";
import { SynJSXStream } from "@/jsx/html/stream/syn-jsx-stream";

describe("JSXToHTMLStream - Unit Tests", () => {
    test("Base case", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "p",
                props: {
                    dataset: {},
                },
                children: [],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        expect(result).toEqual("<p></p>");

        expect(stubbedPush.callCount).toBe(3);
        expect(handleStaticElementSpy.callCount).toBe(1);
    }, 2000);

    test("With head and tails", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "p",
                props: {
                    dataset: {},
                },
                children: [],
            },
            new ContextFactory(),
            ["<body>", "</body>"]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        expect(result).toEqual("<body><p></p></body>");

        expect(stubbedPush.callCount).toBe(5);
        expect(handleStaticElementSpy.callCount).toBe(1);
    }, 2000);

    test("With className", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "p",
                props: {
                    className: "hello",
                    dataset: {},
                },
                children: [],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        expect(result).toEqual(`<p class="hello"></p>`);

        expect(stubbedPush.callCount).toBe(3);
        expect(handleAsyncElementSpy.callCount).toBe(0);
        expect(handleStaticElementSpy.callCount).toBe(1);
    }, 2000);

    test("With style", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "p",
                props: {
                    style: {
                        backgroundColor: "red",
                        padding: "10px",
                    },
                    dataset: {},
                },
                children: [],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        expect(result).toEqual(
            `<p style="background-color: red; padding: 10px;"></p>`
        );

        expect(stubbedPush.callCount).toBe(3);
        expect(handleAsyncElementSpy.callCount).toBe(0);
        expect(handleStaticElementSpy.callCount).toBe(1);
    }, 2000);

    test("With on click", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "button",
                props: {
                    onclick: function (ev) {
                        console.log(ev);
                    },
                    dataset: {},
                },
                children: [],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        const clean = result.replace(/[ \n]{1,}/g, " ");
        expect(clean).toEqual(
            `<button data-element-0="true"></button><script> (function(){ document.querySelector('[element-0]').addEventListener('click', function (ev) { console.log(ev); }) }).call({}) </script>`
        );

        expect(stubbedPush.callCount).toBe(4);
        expect(handleAsyncElementSpy.callCount).toBe(0);
        expect(handleStaticElementSpy.callCount).toBe(1);
    }, 2000);

    test("Function", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: ({ className }) => ({
                    type: "button",
                    props: {
                        className,
                    },
                    children: ["Click"],
                }),
                props: {
                    className: "btn",
                    dataset: {},
                },
                children: [],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        const clean = result.replace(/[ \n]{1,}/g, " ");
        expect(clean).toEqual(`<button class="btn">Click</button>`);

        expect(stubbedPush.callCount).toBe(4);
        expect(handleAsyncElementSpy.callCount).toBe(0);
        expect(handleStaticElementSpy.callCount).toBe(3);
    }, 2000);

    test("With children", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "div",
                props: {
                    className: "container",
                    dataset: {},
                },
                children: [
                    {
                        type: "span",
                        props: {},
                        children: ["hello"],
                    },
                    "friend",
                ],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        const clean = result.replace(/[ \n]{1,}/g, " ");
        expect(clean).toEqual(
            `<div class="container"><span>hello</span>friend</div>`
        );

        expect(stubbedPush.callCount).toBe(7);
        expect(handleAsyncElementSpy.callCount).toBe(0);
        expect(handleStaticElementSpy.callCount).toBe(4);
    }, 2000);

    test("Fragment", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                type: "fragment",
                props: {
                    className: "container",
                    dataset: {},
                },
                children: [
                    {
                        type: "span",
                        props: {},
                        children: ["hello"],
                    },
                    "friend",
                ],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);
        const clean = result.replace(/[ \n]{1,}/g, " ");
        expect(clean).toEqual(`<span class="container">hello</span>friend`);

        expect(stubbedPush.callCount).toBe(5);
        expect(handleAsyncElementSpy.callCount).toBe(0);
        expect(handleStaticElementSpy.callCount).toBe(4);
    }, 2000);

    test("With async component", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                // eslint-disable-next-line @typescript-eslint/require-await
                type: async ({ children }) =>
                    withSxlStaticElement({
                        withChild:
                            children && typeof children[0] === "object"
                                ? children[0]
                                : undefined,
                    }),
                props: {
                    className: "container",
                    dataset: {},
                },
                children: [
                    {
                        type: "span",
                        props: {},
                        children: ["hello"],
                    },
                    "friend",
                ],
            },
            new ContextFactory(),
            ["", ""]
        ) as AsynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");
        const handleAsyncElementSpy = sinon.spy(stream, "handleAsyncElement");
        const handleStaticElementSpy = sinon.spy(stream, "handleStaticElement");

        const result = await readableToString(stream);

        expect(result).toEqual(
            `<div data-placeholder="placeholder-element-1"></div><template id="placeholder-element-1"><p><span>hello</span></p></template><script> sxl.fillPlaceHolder("placeholder-element-1"); </script>`
        );

        expect(stubbedPush.callCount).toBe(11);
        expect(handleAsyncElementSpy.callCount).toBe(1);
        expect(handleStaticElementSpy.callCount).toBe(6);
    }, 2000);

    test("With async component (no JS)", async () => {
        const stream = getHTMLStreamFromJSX(
            {
                // eslint-disable-next-line @typescript-eslint/require-await
                type: async ({ children }) =>
                    withSxlStaticElement({
                        withChild:
                            children && typeof children[0] === "object"
                                ? children[0]
                                : undefined,
                    }),
                props: {
                    className: "container",
                    dataset: {},
                },
                children: [
                    {
                        type: "span",
                        props: {},
                        children: ["hello"],
                    },
                    "friend",
                ],
            },
            new ContextFactory(),
            ["", ""],
            { jsDisabled: true }
        ) as SynJSXStream;

        const stubbedPush = sinon.spy(stream, "push");

        const result = await readableToString(stream);
        const clean = result.replace(/[ \n]{1,}/g, " ");
        expect(clean).toEqual(`<p><span>hello</span></p>`);

        expect(stubbedPush.callCount).toBe(6);
    }, 2000);
});
