import { Layout } from "@/layout";
import {
    DynamicComponent,
    type TrackedPromise,
    withClientData,
    Register,
} from "lean-jsx/lib/server/components";
import type { SXLGlobalContext } from "lean-jsx-types/lib/context";
import type { Request } from "express";

async function getServerDate(): Promise<Date> {
    await Promise.resolve();
    return new Date();
}

type ServerDateComponentContext = SXLGlobalContext & { mmDDYY?: boolean };

async function wait(timeInMillis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeInMillis);
    });
}

@Register
export class JSComponent extends DynamicComponent<
    string,
    SXLGlobalContext,
    { foo?: string } & SXL.Props
> {
    componentID = "dynamic-slow";

    async fetcher() {
        await wait(100);
        return "Slow resource";
    }

    dynamicRender(
        resource: TrackedPromise<string>,
    ): SXL.StaticElement | SXL.AsyncElement {
        if (resource.isPending) {
            return <p id="loading2">Loading...</p>;
        }
        return (
            <p id="loaded2">
                {resource.value} {this.props.foo}
            </p>
        );
    }
}

@Register
export class ServerDateComponent extends DynamicComponent<
    Date,
    ServerDateComponentContext
> {
    componentID = "my-server-date-component";

    async fetcher() {
        const serverDate = await getServerDate();
        return serverDate;
    }

    queryParams(req: Request) {
        return {
            mmDDYY: Boolean(req.query?.mmDDYY),
        };
    }

    dynamicRender(
        data: TrackedPromise<Date>,
        props: SXL.Props<ServerDateComponentContext>,
    ): SXL.StaticElement | SXL.AsyncElement {
        if (data.isPending) {
            return <>Loading...</>;
        }

        const serverDate: Date = data.value;

        if (props?.globalContext?.mmDDYY) {
            const dateFormatted = new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).format(serverDate);
            return <div>Server date: {dateFormatted}</div>;
        }
        return <div>Server date: {serverDate.toISOString()}</div>;
    }
}

export function ReplacerComponent() {
    return (
        <>
            <button
                onclick={withClientData({}, (ev, webContext) => {
                    void webContext?.actions?.refetchElement(
                        "my-server-date-component",
                        {
                            mmDDYY: true,
                        },
                    );
                })}
            >
                Get server date on mm/dd/yyyy format
            </button>
            <button
                onclick={withClientData({}, (ev, webContext) => {
                    console.log("Replace");
                    void webContext?.actions?.refetchElement(
                        "my-server-date-component",
                        {},
                    );
                })}
            >
                Get server date on ISO format
            </button>
        </>
    );
}
export function MainActionsPage() {
    return (
        <Layout
            asideContent={
                <>
                    <p>
                        We can replace dynamic content without reloading the
                        page
                    </p>

                    <p>
                        In this example, we can retrieve the server's date in
                        two different formats. Click in one of the following
                        buttons to update the content below them:
                    </p>

                    <p>
                        Every time you click on a button, a JavaScript request
                        is done to the server to replace the components content
                    </p>
                </>
            }
        >
            <h1>Dynamic content actions</h1>

            <p>
                Click on one of the buttons to update the rendered server date
            </p>
            <div>
                <ReplacerComponent />
            </div>
            <div>
                <h2>Server date:</h2>
                <ServerDateComponent />
            </div>
            <JSComponent foo="bar" />

            <header-menu
                id="dc1"
                name="bar2"
                address={{ street: "18521 Derby", zip: "78660" }}
            ></header-menu>
            <button
                type="button"
                id="btn"
                onclick={withClientData({}, (ev, ctx) => {
                    ctx?.actions.update<"header-menu">("dc1", {
                        name: `${new Date().toISOString()}`,
                    });
                })}
            >
                Click
            </button>
        </Layout>
    );
}
