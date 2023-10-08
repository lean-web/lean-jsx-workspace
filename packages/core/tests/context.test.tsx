import { describe, expect, test } from "@jest/globals";
import { ContextFactory } from "@/jsx/html/context";

describe("context", () => {
    function newButton(fn?: () => void): SXL.StaticElement {
        return {
            type: "button",
            props: {
                onclick:
                    fn ??
                    function () {
                        console.log("1");
                    },
            },
            children: [],
        };
    }

    test("context decorates elements with actions correctly", () => {
        const elements: SXL.StaticElement[] = [newButton(), newButton()];
        const factory = new ContextFactory();

        const decorated = elements.map((el) => {
            const ctx = factory.newContext();
            return ctx.decorate(el);
        });

        const ordered = decorated.map(
            (el) => (el as SXL.StaticElement).props.dataset
        );

        expect(ordered[0] && ordered[0]["element-0"]).toBeTruthy();
        expect(ordered[1] && ordered[1]["element-1"]).toBeTruthy();

        expect(decorated).toMatchSnapshot();
    });
});
