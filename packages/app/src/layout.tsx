import { Lazy } from "lean-jsx/server/components";
import type { SXLGlobalContext } from "lean-jsx-types/context";

import {
    // DynamicProductList,
    ProductList,
    ProductListLoading,
} from "./products/product-list";

import { Nav } from "./components/nav";

function ProductListWrapper({
    productListStart,
    globalContext,
}: {
    productListStart?: number;
    globalContext?: SXLGlobalContext;
}) {
    // if (globalContext?.dynamicProductList && DynamicProductList.Render) {
    //     return <DynamicProductList.Render />;
    // }

    if (globalContext?.withLoadingState) {
        return (
            <Lazy loading={<ProductListLoading />}>
                <ProductList start={productListStart ?? 0} />
            </Lazy>
        );
    }

    return <ProductList start={productListStart ?? 0} />;
}

export function Layout({
    productListStart,
    asideContent,
    children,
}: SXL.Props & { productListStart?: number; asideContent?: JSX.Element }) {
    return (
        <div className="page">
            <Nav />

            <aside>
                {asideContent || (
                    <ProductListWrapper productListStart={productListStart} />
                )}
            </aside>

            <main>{children}</main>
        </div>
    );
}
