import { isFunctionNode, isPromise } from "../../jsx-utils";
import { TrackablePromise } from "./trackable-promise";

export class AsyncChunk {
    private loadingElement?: SXL.StaticElement;
    private asyncElement: TrackablePromise<SXL.StaticElement, any>;
    private id: string;
    processed = false;

    static isAsyncChunk(obj: unknown): obj is AsyncChunk {
        return (
            !!obj &&
            typeof obj === "object" &&
            "placeholder" in obj &&
            "element" in obj
        );
    }

    constructor(
        id: string,
        asyncElement: Promise<SXL.StaticElement>,
        loadingElement?: SXL.StaticElement
    ) {
        this.asyncElement = new TrackablePromise(
            asyncElement.then((element) => {
                if (!element.props.dataset) {
                    element.props.dataset = {};
                }
                // element.props.dataset["data-template"] = this.id;
                return {
                    type: "template",
                    props: {
                        id: this.id,
                    },
                    children: [element],
                };
            }),
            id
        );
        this.id = id;
        this.loadingElement = loadingElement;
    }

    unwrapFragments(
        element: SXL.StaticElement | string
    ): Array<SXL.StaticElement | string> {
        if (typeof element === "string") {
            return [element];
        }
        if (element.type === "fragment") {
            return element.children.flatMap((child) =>
                this.unwrapFragments(child)
            );
        }
        return [element];
    }

    get placeholder(): SXL.StaticElement {
        let actualContent: SXL.StaticElement | undefined = this.loadingElement;
        if (this.loadingElement && isFunctionNode(this.loadingElement)) {
            const child = this.loadingElement.type({
                ...this.loadingElement.props,
                children: this.loadingElement.children,
            });

            if (isPromise(child)) {
                throw new Error(
                    "Cannot use an async component for Lazy loading state"
                );
            }

            if (child.type === "fragment") {
                child.type = "div";
            }

            actualContent = child;
        }
        if (actualContent && typeof actualContent !== "string") {
            const placehoder = actualContent;
            placehoder.props.dataset = placehoder.props.dataset ?? {};
            placehoder.props.dataset[`data-placeholder`] = this.id;
            return placehoder;
        }
        return {
            type: "div",
            props: {
                dataset: {
                    ["data-placeholder"]: this.id,
                },
            },
            children: this.loadingElement
                ? this.unwrapFragments(this.loadingElement)
                : [],
        };
    }

    get element(): TrackablePromise<SXL.StaticElement, any> {
        return this.asyncElement;
    }

    get jsWiring(): string {
        const id = this.id;
        return `<script>
         sxl.fillPlaceHolder("${id}");  
      </script>
      `;
    }
}
