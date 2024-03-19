import { Layout } from "@/layout";
import { APIC, withClientData } from "lean-jsx/server/components";

async function getServerDate(): Promise<Date> {
    await Promise.resolve();
    return new Date();
}

async function wait(timeInMillis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeInMillis);
    });
}

const JSComponent = APIC(
    {
        id: "dynamic-slow",
        requestHandler: async () => {
            await wait(100);
            console.log({ resource: "Slow resource", foo: "" });
            return { resource: "Slow resource", foo: "" };
        },
    },
    ({ resource, foo }) => {
        console.log({ resource, foo });
        return (
            <p id="loaded2">
                {resource} {foo}
            </p>
        );
    },
);

export const ServerDateComponent = APIC(
    {
        id: "my-server-date-component",
        requestHandler: async (req) => {
            const mmDDYY = Boolean(req.query?.mmDDYY);
            const serverDate = await getServerDate();
            return { serverDate, mmDDYY };
        },
    },
    ({ serverDate, mmDDYY }) => {
        if (mmDDYY) {
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
                onclick={withClientData({}, (ev, actions) => {
                    void actions.refetchAPIC("my-server-date-component", {
                        mmDDYY: true,
                    });
                })}
            >
                Get server date on mm/dd/yyyy format
            </button>
            <button
                onclick={(ev, actions) => {
                    console.log("Replace");
                    void actions.refetchAPIC("my-server-date-component", {});
                }}
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
                <ServerDateComponent serverDate={new Date()} mmDDYY={false} />
            </div>
            <JSComponent foo="bar" resource={""} />

            <header-menu
                id="dc1"
                name="bar2"
                address={{ street: "18521 Derby", zip: "78660" }}
            ></header-menu>
            {/* <button
                type="button"
                id="btn"
                onclick={(ev, actions) => {
                    actions.update<"header-menu">("dc1", {
                        name: `${new Date().toISOString()}`,
                    });
                }}
            >
                Click
            </button> */}
        </Layout>
    );
}
