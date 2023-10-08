import { Lazy } from "@/components/lazy";
import { ContextFactory } from "@/jsx/html/context";
import { getHTMLStreamFromJSX } from "@/jsx/html/stream";
import { describe, expect, test } from "@jest/globals";
import pretty from "pretty";

describe("Stream JSX", () => {
    test("Streams JSX as HTML", (done) => {
        async function CostlyComponent(): Promise<SXL.StaticElement> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(
                        <div className="costly">
                            I'm costly content
                            <button
                                onclick={() => console.log("Inside costly")}
                            >
                                Click me
                            </button>
                        </div>
                    );
                });
            });
        }

        const jsxElement = (
            <div>
                <h1>Hello world</h1>
                <CostlyComponent />
                <p>After async</p>
            </div>
        );

        let result = ``;
        const jsxToHTMLStream = getHTMLStreamFromJSX(
            jsxElement,
            new ContextFactory(),
            ["<body>", "</body>"]
        );
        // jsxToHTMLStream.write(jsxElement);
        jsxToHTMLStream.on("data", (data) => {
            result += typeof data === "object" ? JSON.stringify(data) : data;
        });
        jsxToHTMLStream.on("end", () => {
            expect(pretty(result)).toMatchSnapshot();
            done();
        });
    }, 2000);

    test("Streams JSX as HTML into another stream", (done) => {
        async function Async() {
            return <p>I'm async</p>;
        }

        const jsxElement = (
            <div>
                <h1>Hello world</h1>
                <Async />
                <p>After async</p>
            </div>
        );

        let result = ``;

        const jsxToHTMLStream = getHTMLStreamFromJSX(
            jsxElement,
            new ContextFactory(),
            ["<body>", "</body>"]
        );
        // jsxToHTMLStream.write(jsxElement);
        jsxToHTMLStream.on("data", (data) => {
            result += typeof data === "object" ? JSON.stringify(data) : data;
        });
        jsxToHTMLStream.on("end", () => {
            expect(pretty(result)).toMatchSnapshot();
            done();
        });
        // jsxToHTMLStream.end();
    });

    test.skip("Streams JSX as HTML with handlers", () => {
        function Button() {
            return <button onclick={(ev) => console.log(ev)}>Click me!</button>;
        }

        const jsxElement = (
            <div>
                <h1>Hello world</h1>
                <Button />
                <p>After Button</p>
            </div>
        );

        let result = ``;

        const jsxToHTMLStream = getHTMLStreamFromJSX(
            jsxElement,
            new ContextFactory(),
            ["<body>", "</body>"]
        );

        jsxToHTMLStream.on("data", (data) => {
            result +=
                typeof data === "object" ? JSON.stringify(data) : data + "\n";
        });
    });

    test("Streams JSX as HTML with nested async functions", (done) => {
        async function AsyncButton() {
            return (
                <button onclick={() => console.log("Inside costly")}>
                    Click me
                </button>
            );
        }
        async function CostlyComponent(): Promise<SXL.StaticElement> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(
                        <div className="costly">
                            I'm costly content
                            <AsyncButton />
                        </div>
                    );
                });
            });
        }

        const jsxElement = (
            <div>
                <h1>Hello world</h1>
                <Lazy loading={<p>Loading...</p>}>
                    <CostlyComponent />
                </Lazy>
                <p>After async</p>
            </div>
        );

        let result = ``;
        const jsxToHTMLStream = getHTMLStreamFromJSX(
            jsxElement,
            new ContextFactory(),
            ["<body>", "</body>"]
        );
        // jsxToHTMLStream.write(jsxElement);
        jsxToHTMLStream.on("data", (data) => {
            result += typeof data === "object" ? JSON.stringify(data) : data;
        });
        jsxToHTMLStream.on("end", () => {
            expect(pretty(result)).toMatchSnapshot();
            done();
        });
    });

    test("Lazy elements display placeholders", (done) => {
        async function CostlyComponent(): Promise<SXL.StaticElement> {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(<div className="costly">I'm costly content</div>);
                });
            });
        }

        const jsxElement = (
            <Lazy loading={<p>Loading...</p>}>
                <CostlyComponent />
            </Lazy>
        );

        let result = ``;
        const jsxToHTMLStream = getHTMLStreamFromJSX(
            jsxElement,
            new ContextFactory(),
            ["<body>", "</body>"]
        );
        // jsxToHTMLStream.write(jsxElement);
        jsxToHTMLStream.on("data", (data) => {
            result += typeof data === "object" ? JSON.stringify(data) : data;
        });
        jsxToHTMLStream.on("end", () => {
            expect(result.includes("Loading")).toBeTruthy();
            expect(pretty(result)).toMatchSnapshot();
            done();
        });
    });
});
