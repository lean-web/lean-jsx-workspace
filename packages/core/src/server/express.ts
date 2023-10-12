import type { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { DynamicController } from "../components/lazy";
import { JSXStream } from "@/jsx/html/stream/jsx-stack";
import { SXLGlobalContext } from "lean-jsx/src/types/context";
import { pipeline } from "stream/promises";
import { GetDynamicComponent } from "@/components/lazy";
import fs from "fs";

/**
 * Options to render JSX in a stringified HTML document.
 */
export interface RenderOptions {
    /**
     * The string content of the HTML document to render.
     */
    template: string;
    /**
     * The string placeholder that will be used to split the document.
     *
     * By default, <!--EAGER_CONTENT--> will be used.
     *
     */
    contentPlaceholder?: string;
    /**
     * Whether the streamed HTML should run in "sync" mode (waiting in sequential
     * order for each JSX component to be rendered)
     */
    sync?: boolean;
    /**
     * The global context to pass to each JSX component.
     */
    globalContext?: SXLGlobalContext;
}

/**
 * Render a JSX element into an HTML template.
 *
 * @param element - The JSX component to render
 * @param options - The {@link RenderOptions}
 * @returns A {@link Readable} stream
 */
export async function render(element: SXL.Element, options: RenderOptions) {
    const { template, sync, globalContext, contentPlaceholder } = options;
    const [before, after] = template.split(
        contentPlaceholder ?? "<!--EAGER_CONTENT-->"
    );

    const stream = new JSXStream(element, globalContext ?? {}, {
        pre: [before],
        post: [after],
        sync,
    });

    await stream.init();
    return stream;
}

/**
 * Render a JSX component synchronously. This is meant to be used in API endpoints
 * that return the contents for a subset of components in the application.
 *
 * @param element - The JSX component to render
 * @param globalContext - And optional global context object
 * @returns A {@link Readable} stream
 */
export async function renderComponent(
    element: SXL.Element,
    globalContext?: SXLGlobalContext
) {
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
 * Options for the SXL middleware options
 */
export interface SXLMiddlewareOptions {
    /**
     * A list of {@link DynamicController} objects.
     *
     * These can be created with {@link GetDynamicComponent}
     */
    components: DynamicController[];
}

/**
 * Middleware for Express for easily suppoting the rendering of dynamic components
 * in Express.
 *
 * @param options - The {@link SXLMiddlewareOptions}
 * @returns An Express middleware.
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
}

/**
 * Options for rendering JSX inside an HTML template
 */
export interface RenderWithTemplateOptions
    extends Omit<RenderOptions, "template"> {
    /**
     * The file path to the HTML template. This path will be used as-is to try to fetch
     * the HTML contents.
     */
    templatePath: string;
}

/**
 * Stream a JSX component -inside an HTML template- to an Express HTTP Response.
 *
 * @param res - The Express Response object
 * @param element - The JSX component to render
 * @param options - The {@link RenderWithTemplateOptions}
 * @param next - An Express Middleware "next" function, if available.
 */
export async function renderWithTemplate(
    res: Response,
    element: SXL.Element,
    options: RenderWithTemplateOptions,
    next?: NextFunction
) {
    try {
        const template = fs.readFileSync(options.templatePath, "utf-8");
        const appHtml = await render(element, { ...options, template });

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
            if (next) {
                next(e);
            }
        }
    }
}
