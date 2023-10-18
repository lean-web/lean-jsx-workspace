import { Lazy } from "@/components";
import {
    ContextManager,
    LocalContext,
    isAsyncElementWithContext
} from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "@/types/context";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

interface MyGlobalContext extends SXLGlobalContext {
    username: string;
}

describe("context-manager.test", () => {
    const { contextManager: ctxManagerFactory } = setupTests();
    test("fromStaticElement", () => {
        const contextManager = ctxManagerFactory({ username: "" });

        const result = contextManager.fromStaticElement(
            (<div data-attr="yes">Hello</div>) as SXL.StaticElement
        );

        expect(result.placeholder).toBeUndefined();
        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.element).toStrictEqual(<div data-attr="yes">Hello</div>);
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(0);
    });

    test("fromStaticElement - with handler", () => {
        const onClick = ev => console.log(ev);
        const contextManager = ctxManagerFactory({ username: "" });

        const result = contextManager.fromStaticElement(
            (<button onclick={onClick}>Click</button>) as SXL.StaticElement
        );

        expect(result.placeholder).toBeUndefined();
        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.element).toStrictEqual({
            actions: {
                onclick: onClick
            },
            children: ["Click"],
            props: {
                dataset: {
                    "data-action": "element-0"
                },
                onclick: ""
            },
            type: "button"
        });
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(1);
        expect(result.handlers[0]).toStrictEqual([
            "onclick",
            onClick.toString()
        ]);
    });

    test("fromFunction", () => {
        const contextManager = ctxManagerFactory({ username: "" });
        function Hello() {
            return <p>Hello</p>;
        }
        const result = contextManager.fromFunction(
            (<Hello />) as SXL.FunctionElement
        );

        expect(result.placeholder).toBeUndefined();
        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.element).toStrictEqual(<p>Hello</p>);
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(0);
    });

    test("fromFunction: With handler", () => {
        const contextManager = ctxManagerFactory({ username: "" });
        const onClick = () => console.log("Hello");
        function Hello() {
            return <p onclick={onClick}>Hello</p>;
        }
        const result = contextManager.fromFunction(
            (<Hello />) as SXL.FunctionElement
        );

        expect(result.placeholder).toBeUndefined();
        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.element).toStrictEqual({
            actions: {
                onclick: onClick
            },
            children: ["Hello"],
            props: {
                dataset: {
                    "data-action": "element-0"
                },
                onclick: ""
            },
            type: "p"
        });
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(1);
        expect(result.handlers[0]).toStrictEqual([
            "onclick",
            onClick.toString()
        ]);
    });

    test("fromFunction: With handler in function component", () => {
        const contextManager = ctxManagerFactory({ username: "" });
        const onClick = () => console.log("Hello");
        function Hello({ onclick }: SXL.ComponentProps<MyGlobalContext>) {
            return <button onclick={onclick}>Click</button>;
        }
        const result = contextManager.fromFunction(
            (<Hello onclick={onClick} />) as SXL.FunctionElement
        );

        expect(result.placeholder).toBeUndefined();
        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.element).toStrictEqual({
            actions: {
                onclick: onClick
            },
            children: ["Click"],
            props: {
                dataset: {
                    "data-action": "element-0"
                },
                onclick: ""
            },
            type: "button"
        });
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(1);
        expect(result.handlers[0]).toStrictEqual([
            "onclick",
            onClick.toString()
        ]);
    });

    test("fromFunction: async", () => {
        const contextManager = ctxManagerFactory({ username: "" });
        const onClick = () => console.log("Hello");
        async function Hello(): SXL.AsyncElement {
            return new Promise(resolve =>
                resolve(<p onclick={onClick}>Hello</p>)
            );
        }
        const result = contextManager.fromFunction(
            (<Hello />) as SXL.FunctionElement
        );

        expect(result.placeholder).toStrictEqual({
            type: "div",
            props: {
                dataset: {
                    "data-placeholder": "element-0"
                }
            },
            children: []
        });
        expect(isAsyncElementWithContext(result)).toBeTruthy();
        expect(result.element).toHaveProperty("then");
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(0);
    });

    test("fromClass", () => {
        const contextManager = ctxManagerFactory({ username: "" });

        const result = contextManager.fromClass(
            (
                <Lazy loading={<>Loading</>}>
                    <p>Hello</p>
                </Lazy>
            ) as SXL.ClassElement
        );

        expect(result.placeholder).toStrictEqual({
            type: "div",
            props: {
                dataset: {
                    "data-placeholder": "element-0"
                }
            },
            children: ["Loading"]
        });
        expect(isAsyncElementWithContext(result)).toBeTruthy();
        expect(result.element).toHaveProperty("then");
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(0);
    });

    test("fromFunction: With local context", () => {
        const contextManager = ctxManagerFactory({ username: "" });

        interface HelloContext {
            firstName: string;
        }

        function Hello(this: HelloContext) {
            this.firstName = "Pedro";

            return <p onclick={() => console.log(this.firstName)}>Hello</p>;
        }
        const result = contextManager.fromFunction(
            (<Hello />) as SXL.FunctionElement
        );

        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.placeholder).toBeUndefined();
        expect(result.element).toEqual({
            children: ["Hello"],
            actions: {
                onclick: expect.any(Function)
            },
            props: {
                dataset: {
                    "data-action": "element-0"
                },
                onclick: ""
            },
            type: "p"
        });
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(1);
        expect(result.handlers[0]).toStrictEqual([
            "onclick",
            "() => console.log(this.firstName)"
        ]);
        const expectedContext = new LocalContext();
        expectedContext.firstName = "Pedro";
        expect(result.context).toStrictEqual(expectedContext);
    });

    test("fromFunction: With global context", () => {
        const contextManager = ctxManagerFactory({ username: "pedro" });

        function Hello({ globalContext }: SXL.ComponentProps<MyGlobalContext>) {
            return <div>Name: {globalContext?.username}</div>;
        }
        const result = contextManager.fromFunction(
            (<Hello />) as SXL.FunctionElement
        );

        expect(isAsyncElementWithContext(result)).toBeFalsy();
        expect(result.placeholder).toBeUndefined();
        expect(result.element).toEqual({
            children: ["Name: ", "pedro"],
            actions: {},
            props: {
                dataset: {}
            },
            type: "div"
        });
        expect(result.id).toBeTruthy();
        expect(result.handlers.length).toBe(0);
    });
});
