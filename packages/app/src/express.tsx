/* eslint-disable @typescript-eslint/no-misused-promises */
import path from "path";
import express from "express";
// import { renderWithTemplate, sxlMiddleware } from "lean-jsx/dist/server";
import LeanApp from "./engine";
import bodyParser from "body-parser";
import { Home } from "./home/home";
import { ProductDescription } from "./products/product-description";
import { DynamicProductList } from "./products/product-list";
import compression from "compression";
import { parseQueryParams } from "./context";
import { shouldCompress } from "lean-jsx/dist/server";

/**
 * Output path for the bundled assets:
 * Default path: /assets (relative to the server script)
 * Includes bundled JS and CSS
 */
const ASSETS_PATH = path.resolve(__dirname, "/assets");

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
        defaultLogLevel: "info"
    });
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(
        compression({
            filter: shouldCompress
        })
    );

    app.use(
        "/",
        express.static(PUBLIC_PATH, {
            index: false,
            maxAge: "30d",
            dotfiles: "ignore"
        })
    );

    app.use(
        LeanApp.expressLogging({
            defaultLogLevel: "info",
            file: {
                error: {
                    destination: path.resolve(__dirname, "logs", "error.json")
                }
            }
        })
    );

    // Configure the lean.jsx middleware:
    app.use(
        LeanApp.middleware({
            components: [DynamicProductList],
            /**
             * Set custom response attributes.
             * @param resp - the server response, before streaming
             *  the page content to the browser.
             * @returns  - the configured response
             */
            configResponse: resp => resp.set("Content-Security-Policy", CSP),
            globalContextParser: args => parseQueryParams(args)
        })
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
                templateName: "index"
            },
            next
        );
    });

    // configure the main page:
    app.use("/", async (req, res) => {
        const globalContext = parseQueryParams(req);

        await LeanApp.renderWithTemplate(
            res
                .set("Content-Security-Policy", CSP)
                .set("Transfer-Encoding", "chunked"),
            <Home />,
            globalContext,
            {
                templateName: "index"
            }
        );
    });

    logger.info("Listening in port 5173");
    app.listen(5173);
}

createServer();
