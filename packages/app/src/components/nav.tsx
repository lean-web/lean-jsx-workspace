import type { RequestQueryParams } from "../context";
import { toQueryString } from "lean-jsx/server/components";

interface NavItemProps extends SXL.Props {
    title: string;
}

function NavItem(props: NavItemProps) {
    return (
        <details className="section">
            <summary>{props.title}</summary>

            <ul>{props.children?.map((child) => <li>{child}</li>)}</ul>
        </details>
    );
}

export function Nav({ globalContext }: { globalContext?: RequestQueryParams }) {
    const isLoadingStateEnabled = globalContext?.withLoadingState ?? false;
    const dynamicProductListLinkEnabled =
        globalContext?.dynamicProductList ?? false;
    const isJSDisabled = globalContext?.jsDisabled ?? false;

    const loadingStateToggle = isLoadingStateEnabled
        ? "/"
        : "/?withLoadingState=true";

    const dynamicProductListLink = dynamicProductListLinkEnabled
        ? "/"
        : "/?dynamicProductList=true";

    const disableJSLink = isJSDisabled ? "/" : "/?jsDisabled=true";

    return (
        <nav>
            <a className="section" href={toQueryString("/", globalContext)}>
                Home
            </a>
            <NavItem title="Rendering types">
                <a
                    href={loadingStateToggle}
                    title={`Click on this link to toggle on and off a loading state while rendering the list of products. The document's "load" event will fire after the list is fully rendered`}
                >
                    Turn loading state {isLoadingStateEnabled ? "off" : "on"}
                </a>
                <a
                    href={dynamicProductListLink}
                    title="Click on this link to use a JS component to asynchronously render the list of products using a fetch request. The document will be considered loaded before the list is rendered."
                >
                    Turn dynamic components{" "}
                    {dynamicProductListLinkEnabled ? "off" : "on"}
                </a>
                <a
                    href={disableJSLink}
                    title="Click on this link to render the document without using any JavaScript at all."
                >
                    Turn rendering with no JS {isJSDisabled ? "off" : "on"}
                </a>
            </NavItem>
            <NavItem title="Web actions">
                <a
                    href="/actions"
                    title={`An example of replacing dynamic content`}
                >
                    Dynamic content replacement
                </a>
            </NavItem>
        </nav>
    );
}
