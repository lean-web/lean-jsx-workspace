/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    Svg: React.ComponentType<React.ComponentProps<"svg">>;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: "Server-driven JSX components",
        Svg: require("@site/static/img/servers.svg").default,
        description: (
            <>
                Use JSX and TypeScript to build asynchronous, atomic UI
                components that are rendered once in the server and returned as
                pure HTML. No React needed.
            </>
        )
    },
    {
        title: "Streamed HTTP responses",
        Svg: require("@site/static/img/stream.svg").default,
        description: (
            <>
                Stream HTML as it's generated from your JSX components for an
                optimal time-to-first-byte. Powered by NodeJS Express.
            </>
        )
    },
    {
        title: "Minimal bundle size",
        Svg: require("@site/static/img/bundle.svg").default,
        description: (
            <>
                Your JavaScript is only for actions. No need to load large
                bundles just for rendering a page.
            </>
        )
    }
];

function Feature({ title, Svg, description }: FeatureItem) {
    return (
        <div className={clsx("col col--4")}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
