/* eslint-disable @typescript-eslint/no-misused-promises */
import fs from "fs";
import path from "path";
import express from "express";
import { SXLGlobalContext } from "@sxl/core/src/types/context";
import { render, sxlMiddleware } from "@sxl/core/dist/server";

import bodyParser from "body-parser";
import { pipeline } from "node:stream/promises";
// import App from "./app";
// import { CostlyComponent } from "./web/components/costly-component";
// import { Home } from "./web/home/home";
import { type Response } from "express";
import { RequestQueryParams } from "./context";
import { Home } from "./home/home";
import { ProductDescription } from "./products/product-description";
import { DynamicProductList } from "./products/product-list";
// import { ProductDescription } from "./web/products/product-description";
// import { RequestQueryParams } from "./request-params";
// import { DynamicProductList } from "./web/products/product-list";

// import html from "./web/index.html";

// console.log(html);

const ASSETS_PATH = "./dist";

declare module "@sxl/core/src/types/context" {
    interface SXLGlobalContext extends RequestQueryParams {}
}

function isStringRepresentingBoolean(str: string) {
    return str === "true" || str === "false";
}

function isStringRepresentingNumber(str: string) {
    return !isNaN(parseFloat(str)) && str.trim() !== "";
}

function toGlobalState(args: Record<string, unknown>): SXLGlobalContext {
    return Object.fromEntries(
        Object.entries(args).map(([key, value]) => {
            if (typeof value !== "string") {
                return [key, value];
            }
            if (isStringRepresentingNumber(value)) {
                return [key, parseFloat(value)];
            }
            if (isStringRepresentingBoolean(value)) {
                return [key, value === "true"];
            }
            return [key, value];
        })
    );
}

async function renderWithTemplate(
    res: Response,
    element: SXL.Element,
    templatePath: string,
    ctx?: SXLGlobalContext
) {
    try {
        // const html = import("./web/index.html");

        const template = fs.readFileSync(templatePath, "utf-8");
        const appHtml = render(element, template, ctx, ctx?.jsDisabled);

        await pipeline(
            appHtml,
            res.status(200).set({ "Content-Type": "text/html" })
        );
    } catch (e) {
        if (
            e instanceof Error &&
            "code" in e &&
            e.code === "ERR_STREAM_PREMATURE_CLOSE"
        ) {
            console.error("Stream closed prematurely");
        } else {
            // // if (e instanceof Error) {
            // //   vite.ssrFixStacktrace(e);
            // // }
            // next(e);
        }
    }
}

function createServer() {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/", (req, res, next) => {
        if (/(jpe?g|png|gif)/.test(req.originalUrl)) {
            const md = express.static(ASSETS_PATH);
            md.call(null, req, res, next);
        } else {
            next();
        }
    });

    app.use("/robots.txt", (req, res) => {
        res.send(`User-agent: *
    Allow: /`);
    });

    app.use("/assets", express.static(ASSETS_PATH + "/assets"));
    app.use(
        sxlMiddleware({
            components: [DynamicProductList],
        })
    );

    app.get("/product/:productId", async (req, res) => {
        const productId = req.params["productId"];
        const params = toGlobalState(req.query);
        console.log({ productId }); //

        // const indexHtml: string = await import("./web/index.html");

        await renderWithTemplate(
            res,
            <ProductDescription productId={productId} />,
            path.resolve(ASSETS_PATH, "./index.html"),
            // indexHtml,
            params
        );
    });

    app.use("/", async (req, res) => {
        const params = toGlobalState(req.query);
        // const url = req.originalUrl;
        console.log("Start loading");
        console.log("html", path.resolve(ASSETS_PATH, "./index.html"));
        // const indexHtml: string = await import("./web/index.html");

        await renderWithTemplate(
            res,
            <Home />,
            path.resolve(ASSETS_PATH, "./index.html"),
            // indexHtml,
            params
        );
    });

    console.log("Listening in port 5173");
    app.listen(5173);
}

createServer();
