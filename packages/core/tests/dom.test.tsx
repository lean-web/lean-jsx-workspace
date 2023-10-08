import { describe, expect, test } from "@jest/globals";

import {
    TestJSXStream,
    domContent,
    jsxToDOMTest,
    stringToDom,
} from "./test-utils-dom";

import { readableToString } from "./test-utils";
import { ContextFactory } from "@/jsx/html/context";
import { Lazy } from "@/components/lazy";

describe("DOM test", () => {
    test("Base flow", async () => {
        const doms = await jsxToDOMTest(<p>Hello</p>);

        expect(doms[0]).toBe("<p>Hello</p>");
    });

    test("Async flow", async () => {
        async function ACmp() {
            return <p>Hello world</p>;
        }

        const staticFirstPart = "<div><h1>Hello</h1>";
        const placeholder =
            '<div data-placeholder="placeholder-element-3"></div>';
        const end = `</div>`;

        const doms = await jsxToDOMTest(
            <div>
                <h1>Hello</h1>
                <ACmp />
            </div>
        );

        expect(doms[0]).toBe(`${staticFirstPart}${placeholder}${end}`);

        expect(doms[1]).toBe(
            `${staticFirstPart}<p>Hello world</p></div><template id="placeholder-element-3"><p>Hello world</p></template><script> sxl.fillPlaceHolder("placeholder-element-3"); </script> `
        );
    });

    test("Async flow with loading state", async () => {
        const staticFirstPart = "<h1>Hello</h1>";
        const lazyContent = `<p>Hello world</p>`;
        const loadingContent = "Loading";

        async function ACmp() {
            return <p>Hello world</p>;
        }

        const stream = new TestJSXStream(
            (
                <div>
                    <h1>Hello</h1>
                    <Lazy loading={<>Loading</>}>
                        <ACmp />
                    </Lazy>
                </div>
            ),
            new ContextFactory(),
            [""],
            [""]
        );

        const content = await readableToString(stream);
        stream.flushes.push(content);

        const doms = stream.flushes
            .map((flush) => stringToDom(flush))
            .flatMap(([dom, domChanges]) => [domContent(dom), ...domChanges]);

        expect(doms[0]).toBe(
            `<div>${staticFirstPart}<div data-placeholder="placeholder-element-2">${loadingContent}</div></div>`
        );
        expect(doms[1]).toBe(
            `<div>${staticFirstPart}${lazyContent}</div><template id="placeholder-element-2"><div data-placeholder="placeholder-element-8"></div></template><script> sxl.fillPlaceHolder("placeholder-element-2"); </script> <template id="placeholder-element-8"><p>Hello world</p></template><script> sxl.fillPlaceHolder("placeholder-element-8"); </script> `
        );
        expect(doms[2]).toBe(
            `<div>${staticFirstPart}<div data-placeholder="placeholder-element-8">${loadingContent}</div></div><template id="placeholder-element-2"><div data-placeholder="placeholder-element-8"></div></template><script> sxl.fillPlaceHolder("placeholder-element-2"); </script>`
        );
        expect(doms[3]).toBe(
            `<div>${staticFirstPart}${lazyContent}</div><template id="placeholder-element-2"><div data-placeholder="placeholder-element-8"></div></template><script> sxl.fillPlaceHolder("placeholder-element-2"); </script> <template id="placeholder-element-8"><p>Hello world</p></template><script> sxl.fillPlaceHolder("placeholder-element-8"); </script>`
        );
        expect(doms.length).toBe(4);
    });
});
