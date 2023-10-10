/* eslint-disable @typescript-eslint/no-namespace */
import { SXLGlobalContext } from "@/context";

export function toQueryString(
    url: string,
    globalContext?: SXLGlobalContext
): string {
    if (!globalContext) {
        return url;
    }
    return (
        url +
        "?" +
        Object.entries(globalContext)
            .filter(([key, value]) => !!key && !!value)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
    );
}

interface ComponentArgs extends SXL.Props {
    loading: SXL.Element;
}

abstract class ClassComponent {
    abstract render(): SXL.StaticElement;
    abstract renderLazy(): SXL.AsyncElement;
}

function isPromise(
    jsx: SXL.StaticElement | SXL.AsyncElement | undefined
): jsx is SXL.AsyncElement {
    return !!jsx && "then" in jsx;
}

export class Lazy extends ClassComponent {
    props: ComponentArgs;

    constructor(props: ComponentArgs) {
        super();
        this.props = props;
    }

    async renderLazy(): SXL.AsyncElement {
        if (!this.props.children) {
            throw new Error(
                "There is no child in Lazy to render. This is probably a mistake. If not, please file a bug."
            );
        }
        const allResolved = await Promise.all(this.props.children);
        return <>{allResolved}</>;
    }

    render(): SXL.StaticElement {
        if (isPromise(this.props.loading)) {
            return (<></>) as SXL.StaticElement;
        }
        return this.props.loading;
    }
}

interface PendingResolve<T> {
    isPending: true;
    isResolved: false;
    isError: false;
    value: null;
}

interface ResolvedPromise<T> {
    isPending: false;
    isResolved: true;
    isError: false;
    value: T;
}

type TrackedPromise<T> = PendingResolve<T> | ResolvedPromise<T>;

export interface DynamicController {
    contentId: string;
    Render: (props: SXL.Props) => SXL.Element;
    Api: (props: SXL.Props) => SXL.AsyncElement;
}

export function GetDynamicComponent<T>(
    contentId: string,
    fetcher: () => Promise<T>,
    render: (data: TrackedPromise<T>) => SXL.Element
): DynamicController {
    return {
        Render: (props: SXL.Props) => (
            <dynamic-component
                data-id={toQueryString(contentId, props.globalContext)}
                className="dyn"
            >
                {render({
                    isPending: true,
                    isError: false,
                    isResolved: false,
                    value: null,
                    ...props,
                })}
            </dynamic-component>
        ),
        Api: async (props: SXL.Props) => {
            const data = await fetcher();
            return render({
                isPending: false,
                isError: false,
                isResolved: true,
                value: data,
                ...props,
            });
        },
        contentId,
    };
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "dynamic-component": Partial<HTMLElement>;
        }
    }
}
