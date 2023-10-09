import { ContextFactory } from "@/jsx/html/context";
import { AsynJSXStream } from "@/jsx/html/stream/async-jsx-stream";
import { describe, expect, test } from "@jest/globals";
import { readableToString } from "../../../test-utils";

describe("async-jsx-stream", () => {
    test("one element", async () => {
        const stream = new AsynJSXStream(
            <p>Hello</p>,
            new ContextFactory(),
            [],
            []
        );
        const text = await readableToString(stream);

        expect(text).toBe("<p>Hello</p>");
    });

    test("one async element", async () => {
        const AsyncElement = (): SXL.Element => {
            return new Promise((resolve) => {
                resolve(<p>Hello</p>);
            });
        };
        const stream = new AsynJSXStream(
            (
                <div>
                    <AsyncElement />
                </div>
            ),
            new ContextFactory(),
            [],
            []
        );
        const text = await readableToString(stream);

        expect(text).toBe(
            `<div><div data-placeholder="placeholder-element-2"></div></div><template id="placeholder-element-2"><p>Hello</p></template><script> sxl.fillPlaceHolder("placeholder-element-2"); </script>`
        );
    });
});
