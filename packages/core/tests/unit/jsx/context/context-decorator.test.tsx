import { Lazy } from "@/components";
import { decorateContext } from "@/jsx/context/context-decorator";
import {
    ContextManager,
    isAsyncElementWithContext,
} from "@/jsx/context/context-manager";
import { describe, expect, test } from "@jest/globals";
describe("context-decorator.test", () => {
    test("decorate static component with no handlers", () => {
        const contextManager = new ContextManager({ username: "" });

        const result = contextManager.fromStaticElement(
            (<div data-attr="yes">Hello</div>) as SXL.StaticElement
        );

        const decoration = decorateContext(result);

        expect(decoration).toBe("");
    });

    test("decorate static component with one handler", () => {
        const contextManager = new ContextManager({ username: "" });

        const result = contextManager.fromStaticElement(
            (
                <button onclick={(ev) => console.log(ev)} data-attr="yes">
                    Click
                </button>
            ) as SXL.StaticElement
        );

        const decoration = decorateContext(result);

        expect(decoration).toMatchInlineSnapshot(`
"<script>
      (function(){
        document.querySelector('[data-action="element-0"]').addEventListener('click', (ev) => console.log(ev))
      }).call({})
    </script>"
`);
    });

    test("decorate static component with two handlers", () => {
        const contextManager = new ContextManager({ username: "" });

        const result = contextManager.fromStaticElement(
            (
                <button
                    onclick={(ev) => console.log(ev)}
                    onload={() => alert("Go!")}
                    data-attr="yes"
                >
                    Click
                </button>
            ) as SXL.StaticElement
        );

        const decoration = decorateContext(result);

        expect(
            !isAsyncElementWithContext(result) && result.element.props.dataset
                ? result.element.props.dataset["data-action"]
                : ""
        ).toBe("element-0");

        expect(decoration).toMatchInlineSnapshot(`
"<script>
      (function(){
        document.querySelector('[data-action="element-0"]').addEventListener('click', (ev) => console.log(ev));
document.querySelector('[data-action="element-0"]').addEventListener('load', () => alert("Go!"))
      }).call({})
    </script>"
`);
    });

    test("decorate function component with one handler and local context", () => {
        const contextManager = new ContextManager({ username: "" });

        function Button(this: { name: string }) {
            this.name = "Pedro";
            return (
                <button
                    onclick={(ev) => console.log(`Hi, my name is ${this.name}`)}
                >
                    {this.name}, click here
                </button>
            );
        }

        const result = contextManager.fromFunction(
            (<Button />) as SXL.FunctionElement
        );

        const decoration = decorateContext(result);

        expect(decoration).toMatchInlineSnapshot(`
"<script>
      (function(){
        document.querySelector('[data-action="element-0"]').addEventListener('click', (ev) => console.log(\`Hi, my name is \${this.name}\`))
      }).call({"name":"Pedro"})
    </script>"
`);
    });

    test("decorate async function component ", () => {
        const contextManager = new ContextManager({ username: "" });

        async function Button(this: { name: string }) {
            this.name = "Pedro";
            return (
                <button
                    onclick={(ev) => console.log(`Hi, my name is ${this.name}`)}
                >
                    {this.name}, click here
                </button>
            );
        }

        const result = contextManager.fromFunction(
            (<Button />) as SXL.FunctionElement
        );

        const decoration = decorateContext(result);

        expect(decoration).toMatchInlineSnapshot(`""`);
    });

    test("decorate async function component ", () => {
        const contextManager = new ContextManager({ username: "" });

        const result = contextManager.fromClass(
            (
                <Lazy
                    loading={
                        <button onclick={() => console.log(`Still loading`)}>
                            Click while loading
                        </button>
                    }
                >
                    <div>Hello</div>{" "}
                </Lazy>
            ) as SXL.ClassElement
        );

        const decoration = decorateContext(result);

        expect(decoration).toMatchInlineSnapshot(`""`);
    });
});
