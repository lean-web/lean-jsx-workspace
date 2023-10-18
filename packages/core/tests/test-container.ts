import { ContextManager } from "@/jsx/context/context-manager";
import { JSXStack, JSXStream } from "@/jsx/html/stream/jsx-stack";
import { ILogger, LoggerConfiguration } from "@/jsx/logging/logger";
import { DefaultLogger, ErrorHandler } from "@/server/express";
import { SXLGlobalContext } from "@/types/context";

export function setupTests() {
    function getTestLogger(conf?: LoggerConfiguration): ILogger {
        return new DefaultLogger({
            defaultLogLevel: conf?.defaultLogLevel ?? "debug"
        });
    }

    return {
        jsxStream: <G extends SXLGlobalContext>(
            root: SXL.Element,
            globalContext: G,
            options?: LoggerConfiguration
        ): JSXStream<G> => {
            const testLogger = getTestLogger(options);
            return new JSXStream<G>(
                root,
                new ContextManager(globalContext, new ErrorHandler(testLogger)),
                testLogger
            );
        },

        jsxStack: <G extends SXLGlobalContext>(
            globalContext: G,
            options?: LoggerConfiguration
        ) => {
            const testLogger = getTestLogger(options);

            return new JSXStack<G>(
                getTestLogger(options),
                new ContextManager(globalContext, new ErrorHandler(testLogger))
            );
        },

        contextManager: <G extends SXLGlobalContext>(
            globalContext: G
        ): ContextManager<G> =>
            new ContextManager<G>(
                globalContext,
                new ErrorHandler(getTestLogger())
            )
    };
}
