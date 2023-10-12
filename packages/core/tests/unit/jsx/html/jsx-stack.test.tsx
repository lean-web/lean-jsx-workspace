import { JSXStack } from "@/jsx/html/stream/jsx-stack";
import { describe, expect, test } from "@jest/globals";
describe("jsx-stack.test", () => {
    test("static elements", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        void stack.push(
            <div>
                <p>E1</p>
                <p>E2</p>
            </div>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toBe("<div><p>E1</p><p>E2</p></div>");
    });

    test("static elements - with handlers", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        void stack.push(
            <div>
                <p>E1</p>
                <p>E2</p>
                <button onclick={() => console.log("clicked")}>Click</button>
            </div>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`
"<div><p>E1</p><p>E2</p><button data-action="element-3">Click</button><script>
      (function(){
        document.querySelector('[data-action="element-3"]').addEventListener('click', () => console.log("clicked"))
      }).call({})
    </script></div>"
`);
    });

    test("function component", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        function E1() {
            return <p>E1</p>;
        }
        void stack.push(
            <div>
                <E1 />
                <p>E2</p>
            </div>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toBe("<div><p>E1</p><p>E2</p></div>");
    });

    test("function component: nested one level", async () => {
        const stack = new JSXStack({ username: "Pedro" });

        function E1() {
            return <p>E1</p>;
        }
        function List() {
            return (
                <>
                    <E1 />
                    <p>E2</p>
                </>
            );
        }
        void stack.push(<List />);

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`"<p>E1</p><p>E2</p>"`);
    });

    test("function component: nested two levels", async () => {
        const stack = new JSXStack({ username: "Pedro" });

        function AnotherE1() {
            return <p>E1</p>;
        }

        function E1() {
            return <AnotherE1 />;
        }
        function List() {
            return (
                <>
                    <E1 />
                    <p>E2</p>
                </>
            );
        }
        void stack.push(<List />);

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`"<p>E1</p><p>E2</p>"`);
    });

    test("2 static and 1 async element", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        async function Second(): SXL.AsyncElement {
            return new Promise((resolve) => resolve(<p>E2</p>));
        }
        void stack.push(
            <div>
                <p>E1</p>
                <Second />
                <p>E3</p>
            </div>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`
"<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><p>E2</p></template><script>
    sxl.fillPlaceHolder("element-2");  
 </script>
 "
`);
    });

    test("2 static and 1 async element - with handler", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        async function Second(): SXL.AsyncElement {
            return new Promise((resolve) =>
                resolve(<button onclick={() => "E2"}>E2</button>)
            );
        }
        void stack.push(
            <div>
                <p>E1</p>
                <Second />
                <p>E3</p>
            </div>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`
"<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><button data-action="element-4">E2</button><script>
      (function(){
        document.querySelector('[data-action="element-4"]').addEventListener('click', () => "E2")
      }).call({})
    </script></template><script>
    sxl.fillPlaceHolder("element-2");  
 </script>
 "
`);
    });

    test("2 static and 1 async element - sync mode", async () => {
        const stack = new JSXStack({ username: "Pedro" }, { sync: true });
        async function Second(): SXL.AsyncElement {
            return new Promise((resolve) => resolve(<p>E2</p>));
        }
        void stack.push(
            <div>
                <p>E1</p>
                <Second />
                <p>E3</p>
            </div>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toBe("<div><p>E1</p><p>E2</p><p>E3</p></div>");
    });

    test("test stack events", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        async function Second(): SXL.AsyncElement {
            return new Promise((resolve) =>
                resolve(<button onclick={() => "E2"}>E2</button>)
            );
        }
        void stack.push(
            <div>
                <p>E1</p>
                <Second />
                <p>E3</p>
            </div>
        );

        const flushes: string[] = [];

        async function consume() {
            let first = await stack.pop();

            let all = "";

            stack.on("ASYNC_START", () => {
                flushes.push(all);
            });

            stack.on("ASYNC_END", () => {
                flushes.push(all);
            });

            while (first) {
                all += first;
                first = await stack.pop();
            }
        }

        await consume();

        expect(flushes).toMatchInlineSnapshot(`
[
  "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p>",
  "<div><p>E1</p><div data-placeholder="element-2"></div><p>E3</p></div><template id="element-2"><button data-action="element-4">E2</button><script>
      (function(){
        document.querySelector('[data-action="element-4"]').addEventListener('click', () => "E2")
      }).call({})
    </script></template>",
]
`);
    });

    test("fragment elements", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        void stack.push(<>hello</>);

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`"hello"`);
    });

    test("fragment elements - nested", async () => {
        const stack = new JSXStack({ username: "Pedro" });
        void stack.push(
            <>
                <>hello</>
            </>
        );

        let first = await stack.pop();
        let all = "";

        while (first) {
            all += first;
            first = await stack.pop();
        }

        expect(all).toMatchInlineSnapshot(`"hello"`);
    });
});
