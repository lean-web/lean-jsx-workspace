import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";
import { renderComponent } from "@/server/express";
import { describe, expect, test } from "@jest/globals";

describe("render-component-test", () => {
    test("description", async () => {
        const stream = await renderComponent(<p>Hello</p>, {});

        const html = await readableToString(stream);

        expect(html).toMatchInlineSnapshot(`"<p>Hello</p>"`);
    });
});
