import { isPromise } from "../html/jsx-utils";
import { ILogger } from "../logging/logger";

type ErrorType = "Custom" | "TemplateError" | "AsyncComponent" | "Component";

type NarrowReturnType<T extends () => SXL.Element> = ReturnType<
    T
> extends SXL.StaticElement
    ? SXL.StaticElement
    : SXL.Element;

export interface ErrorHandlerOptions {
    timesRetried?: number;
    extraInfo?: object;
}

export interface IErrorHandler {
    getFallback(context: Record<string, unknown>): SXL.StaticElement;
    reportError(errorType: ErrorType, err: Error): void;
    withErrorHandling<T extends () => SXL.Element>(
        handler: T,
        options: ErrorHandlerOptions
    ): NarrowReturnType<T>;
}

export class ErrorHandler implements IErrorHandler {
    logger: ILogger;
    retries: number = 0;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    getFallback(context: Record<string, unknown>): SXL.StaticElement {
        return (
            <div data-leanjsx-error>An error ocurred</div>
        ) as SXL.StaticElement;
    }

    withErrorHandling<T extends () => SXL.Element>(
        handler: T,
        { timesRetried, extraInfo }: ErrorHandlerOptions
    ): NarrowReturnType<T> {
        try {
            const newElement = handler();
            if (isPromise(newElement)) {
                return newElement.catch(err => {
                    this.reportError("AsyncComponent", err, extraInfo);
                    return this.getFallback({});
                }) as NarrowReturnType<T>;
            }
            return newElement;
        } catch (err) {
            const retried = timesRetried ?? 0;
            if (retried < this.retries) {
                return this.withErrorHandling(handler, {
                    timesRetried: retried + 1,
                    extraInfo
                });
            }
            this.reportError("Component", err, extraInfo);
            return this.getFallback({});
        }
    }

    intoError(err: unknown): Error {
        if (!err) {
            return new Error("Empty error");
        }
        if (err instanceof Error) {
            return err;
        }
        switch (typeof err) {
            case "string":
                return new Error(err);
            case "object":
                return new Error(JSON.stringify(err));
            default:
                return new Error("Unsupported error type");
        }
    }

    reportError(errorType: ErrorType, err: unknown, args?: object) {
        this.logger.error(this.intoError(err), { errorType, ...args });
    }
}
