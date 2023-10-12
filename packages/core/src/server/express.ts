import type { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { pipeline } from "stream";
import { DynamicController } from "../components/lazy";
import { JSXStream } from "@/jsx/html/stream/jsx-stack";
import { SXLGlobalContext } from "@sxl/core/src/types/context";
import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";

export async function render(
    element: SXL.Element,
    template: string,
    globalContext?: SXLGlobalContext,
    jsDisabled?: boolean
) {
    const [before, after] = template.split("<!--EAGER_CONTENT-->");

    const stream = new JSXStream(element, globalContext ?? {}, {
        pre: [before],
        post: [after],
        sync: jsDisabled,
    });

    await stream.init();
    return stream;
}

export async function renderComponent(
    element: SXL.Element,
    globalContext?: SXLGlobalContext
) {
    // return getHTMLStreamFromJSX(
    //     element,
    //     new ContextFactory({ prefix: "acmp" }, globalContext),
    //     ["", ""],
    //     {
    //         jsDisabled: jsDisabled ?? false,
    //     }
    // );
    const stream = new JSXStream(element, globalContext ?? {}, {
        pre: [],
        post: [],
        sync: true,
    });

    await stream.init();
    return stream;
}

function getComponent(req: Request): string | undefined {
    const [_, component] =
        req.originalUrl.match(/\/components\/([\w-]+)/) ?? [];
    return component;
}

export interface SXLMiddlewareOptions {
    components: DynamicController[];
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

/**
 * Middleware for Express
 * @param options
 * @returns
 */
export function sxlMiddleware(options: SXLMiddlewareOptions) {
    const bodyParserMid = bodyParser.urlencoded({ extended: true });
    // Define middleware function
    const controllerMap = Object.fromEntries(
        options.components.map((controller) => [
            controller.contentId,
            controller,
        ])
    );

    return (req: Request, res: Response, next: NextFunction) => {
        bodyParserMid(req, res, (err) => {
            if (err) {
                return next(err);
            }
            try {
                const globalContext = toGlobalState(req.query);
                const maybeComponentName = getComponent(req);

                if (maybeComponentName && controllerMap[maybeComponentName]) {
                    void renderComponent(
                        controllerMap[maybeComponentName].Api({
                            globalContext,
                        }),
                        globalContext
                    )
                        .then((htmlStream) => {
                            htmlStream.pipe(res);
                        })
                        .catch((err) => next(err));

                    // const html = await readableToString(componentHtml);
                    // res.status(200).set({ "Content-Type": "text/html" }).send(html);
                } else {
                    next();
                }
            } catch (error) {
                next(error);
            }
        });
    };

    // app.use(bodyParser.urlencoded({ extended: true }));
    // return async (r: Request, res: Response, next: NextFunction) => {

    // };
}
