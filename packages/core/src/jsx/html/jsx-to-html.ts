/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { isStaticNode } from "./jsx-utils";
import { JSDOM } from "jsdom";

function camelToDashed(str: string): string {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}

function normalizeProKey(key: string) {
    return key.replace("className", "class");
}

function normalizePropValue(value: string | number) {
    return typeof value === "number" ? value : `"${value}"`;
}

function styleDeclarationToString(styles: CSSStyleDeclaration): string {
    let styleString = "";
    const entries = Object.entries(styles);
    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const dashedProperty = camelToDashed(key);
        styleString += `${dashedProperty}: ${value}; `;
    }
    return styleString.trim();
}

function isCSSDeclaration(
    propKey: string,
    propValue: unknown
): propValue is CSSStyleDeclaration {
    return /style/.test(propKey);
}

function flatten(
    props: SXL.Props | Record<string, unknown>
): [string, string | number][] {
    if (Array.isArray(props)) {
        return props;
    }
    return Object.entries(props).flatMap(([key, value]) => {
        if (!value) {
            return [];
        }
        if (/children/.test(key)) {
            return [];
        }
        if (isCSSDeclaration(key, value)) {
            return [[key, styleDeclarationToString(value)]];
        }
        if (typeof value === "object") {
            return flatten(value as Record<string, unknown>);
        }
        if (typeof value !== "string" && typeof value !== "number") {
            throw new Error(
                `Not implemented: Handing property ${key} with value ${value}`
            );
        }
        return [[key, value]];
    });
}

export type OpenAndCloseTags = [string, string];

function serializeObjectToHTML(obj: SXL.StaticElement): [string, string] {
    const { window } = new JSDOM("");
    const { document } = window;

    const { children, ...rest } = obj.props;

    // Create a new element based on the object's tagName property
    const element = document.createElement(obj.type as any);

    // Set attributes from the object
    if (obj.props) {
        for (const [attr, value] of Object.entries(obj.props)) {
            element.setAttribute(attr, value);
        }
    }

    // Get the outerHTML of the created element
    return element.outerHTML.split("><");
}

export class JSXToHTMLUtils {
    static jsxNodeToHTMLTag(jsx: SXL.StaticElement): OpenAndCloseTags {
        if (!isStaticNode(jsx)) {
            throw new Error(
                "Cannot handle JSX nodes with function or class types." +
                    "Please construct the node before calling this method"
            );
        }

        const args = flatten(jsx.props)
            .filter((el) => {
                if (!el) {
                    throw new Error(
                        `Missing prop, ${JSON.stringify(jsx, null, 2)}`
                    );
                }
                return el;
            })
            .map(([key, value]) => {
                try {
                    return `${normalizeProKey(key)}=${normalizePropValue(
                        value
                    )}`;
                } catch (err) {
                    console.error(err, key, value);
                }
            })
            .join(" ");

        return [`<${jsx.type} ${args}>`, `</${jsx.type}>`];

        // const [open, end] = serializeObjectToHTML(jsx);
        // return [`${open}>`, `<${end}`];
    }
}
