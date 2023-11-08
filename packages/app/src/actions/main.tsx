import { Layout } from "@/layout";
import { GetDynamicComponent, webAction } from "lean-jsx/lib/server/components";
import { SXLGlobalContext } from "lean-jsx/src/types/context";

async function getServerDate(): Promise<Date> {
    await Promise.resolve();
    return new Date();
}

export const ServerDateComponent = GetDynamicComponent<
    Date,
    SXLGlobalContext & { mmDDYY?: boolean }
>(
    "my-server-date-component",
    async () => {
        const serverDate = await getServerDate();
        return serverDate;
    },
    (data, props) => {
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
    },
);

export function ReplacerComponent() {
    return (
        <>
            <button
                onclick={webAction({}, (ev, webContext) => {
                    webContext?.actions?.refetchElement(
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
                onclick={webAction({}, (ev, webContext) => {
                    console.log("Replace");
                    webContext?.actions?.refetchElement(
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
                <ServerDateComponent.Render />
            </div>
        </Layout>
    );
}
