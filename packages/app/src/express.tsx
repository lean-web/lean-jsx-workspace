/* eslint-disable @typescript-eslint/no-misused-promises */
import path from "path";
import express from "express";
import { SXLGlobalContext } from "@sxl/core/src/types/context";
import { renderWithTemplate, sxlMiddleware } from "@sxl/core/dist/server";
import bodyParser from "body-parser";
import { RequestQueryParams } from "./context";
import { Home } from "./home/home";
import { ProductDescription } from "./products/product-description";
import { DynamicProductList } from "./products/product-list";

const ASSETS_PATH = path.resolve(__dirname, "./");

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

        await renderWithTemplate(
            res,
            <ProductDescription productId={productId} />,
            {
                templatePath: path.resolve(ASSETS_PATH, "./index.html"),
                globalContext: params,
            }
        );
    });

    app.use("/", async (req, res) => {
        const params = toGlobalState(req.query);

        await renderWithTemplate(res, <Home />, {
            templatePath: path.resolve(ASSETS_PATH, "./index.html"),
            globalContext: params,
        });
    });

    console.log("Listening in port 5173");
    app.listen(5173);
}

createServer();
