/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import LeanApp from "./engine";
import bodyParser from "body-parser";
import { Home } from "./home/home";
import { ProductDescription } from "./products/product-description";
import compression from "compression";
import { parseQueryParams } from "./context";
import { shouldCompress } from "lean-jsx/lib/server";
import { MainActionsPage } from "./actions/main";
import { webAction } from "lean-jsx/lib/server/components";
import { deleteProduct } from "./services/products";

/**
 * Output path for the "public" files:
 * Default output: / (relative to the server script)
 * Includes all resources from the "public" directory.
 */
const PUBLIC_PATH = __dirname;

/**
 * Content-Security-Policy
 */
const CSP = `default-src 'none'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline';base-uri 'self';form-action 'self'`;

/**
 * Create the Express server
 */
function createServer() {
    const logger = LeanApp.logger({
        defaultLogLevel: "info",
    });
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(
        compression({
            filter: shouldCompress,
        }),
    );

    app.use(
        "/",
        express.static(PUBLIC_PATH, {
            index: false,
            maxAge: "30d",
            dotfiles: "ignore",
        }),
    );

    // app.use(
    //     LeanApp.expressLogging({
    //         defaultLogLevel: "info",
    //         file: {
    //             error: {
    //                 destination: path.resolve(__dirname, "logs", "error.json"),
    //             },
    //         },
    //     }),
    // );

    // Configure the lean.jsx middleware:
    app.use(
        LeanApp.middleware({
            /**
             * Set custom response attributes.
             * @param resp - the server response, before streaming
             *  the page content to the browser.
             * @returns  - the configured response
             */
            configResponse: (resp) => resp.set("Content-Security-Policy", CSP),
            globalContextParser: (req) => {
                return parseQueryParams(req);
            },
        }),
    );

    // Configure a page for a specific product
    app.get("/product/:productId", async (req, res, next) => {
        const productId = req.params["productId"];
        const globalContext = parseQueryParams(req);

        await LeanApp.renderWithTemplate(
            res
                .set("Content-Security-Policy", CSP)
                .set("Transfer-Encoding", "chunked"),
            <ProductDescription productId={productId} />,
            globalContext,
            {
                templateName: "index",
            },
            next,
        );
    });

    app.delete("/product/:productId", async (req, res) => {
        const productId = req.params["productId"];

        await deleteProduct(productId);

        res.status(200).send();
    });

    app.get("/actions", async (req, res, next) => {
        const globalContext = parseQueryParams(req);

        await LeanApp.render(
            res.set("Content-Security-Policy", CSP),
            <MainActionsPage />,
            {
                globalContext,
                templateName: "index",
            },
            next,
        );
    });

    app.get("/about", async (req, res) => {
        function MyComponent() {
            const user = { firstName: "John" };
            return (
                <button
                    onclick={webAction(user, (ev, webContext) => {
                        alert(`Hello ${webContext?.data.firstName}`);
                    })}
                >
                    Click to greet user
                </button>
            );
        }

        await LeanApp.render(
            res.set("Content-Security-Policy", CSP),
            <main>
                <h1>About</h1>
                <p>This is a simple page</p>
                <MyComponent />
            </main>,
        );
    });

    // configure the main page:
    app.use("/", async (req, res) => {
        const globalContext = parseQueryParams(req);

        console.log({ globalContext });

        await LeanApp.render(
            res.set("Content-Security-Policy", CSP),
            <Home arg2="This is an arg" />,
            {
                globalContext,
            },
        );
    });

    logger.info("Listening in port 5173");
    app.listen(5173);
}

createServer();
