import { RequestQueryParams } from "../context";
import { toQueryString } from "@sxl/core/dist/server/components";

export function Nav({ globalContext }: { globalContext?: RequestQueryParams }) {
    console.log({ globalContext });

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
            <a href={toQueryString("/", globalContext)}>Home</a>
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
        </nav>
    );
}
