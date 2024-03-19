/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Response } from "express";
import LeanApp from "./engine";
import bodyParser from "body-parser";
import { Home } from "./home/home";
import { ProductDescription } from "./products/product-description";
import compression from "compression";
import { parseQueryParams } from "./context";
import { shouldCompress } from "lean-jsx/server";
import { MainActionsPage } from "./actions/main";
import { withClientData } from "lean-jsx/server/components";
import { deleteProduct } from "./services/products";
import { CheckAllProps } from "./components/intrinsic-props-tests";

/**
 * Output path for the "public" files:
 * Default output: / (relative to the server script)
 * Includes all resources from the "public" directory.
 */
const PUBLIC_PATH = __dirname;

/**
 * Content-Security-Policy
 */
const CSP = `default-src 'none'; script-src 'self' 'unsafe-inline'; frame-src https://www.example.com; connect-src 'self'; img-src https://via.placeholder.com 'self'; style-src 'self' 'unsafe-inline';base-uri 'self';form-action 'self'`;

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

    app.get("/stream", function (req, res, next) {
        //when using text/plain it did not stream
        //without charset=utf-8, it only worked in Chrome, not Firefox
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");

        res.write("Thinking...");
        sendAndSleep(res, 1);
    });

    const sendAndSleep = function (response: Response, counter) {
        if (counter > 10) {
            response.end();
        } else {
            response.write(" ;i=" + counter);
            counter++;
            setTimeout(function () {
                sendAndSleep(response, counter);
            }, 1000);
        }
    };

    // Configure a page for a specific product
    app.get("/product/:productId", async (req, res, next) => {
        const productId = req.params["productId"];
        const globalContext = parseQueryParams(req);

        await LeanApp.renderWithTemplate(
            req,
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
            req,
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
                    onclick={withClientData(user, (ev, actions, data) => {
                        alert(`Hello ${data.firstName}`);
                    })}
                >
                    Click to greet user
                </button>
            );
        }

        await LeanApp.render(
            req,
            res.set("Content-Security-Policy", CSP),
            <main>
                <h1>About</h1>
                <p>This is a simple page</p>
                <MyComponent />
            </main>,
        );
    });

    // configure the main page:
    app.use("/intrinsic", async (req, res) => {
        const globalContext = parseQueryParams(req);

        await LeanApp.render(
            req,
            res.set("Content-Security-Policy", CSP),
            <CheckAllProps />,
            {
                globalContext,
            },
        );
    });

    // configure the main page:
    app.use("/", async (req, res) => {
        const globalContext = parseQueryParams(req);

        await LeanApp.render(
            req,
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
