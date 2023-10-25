import { Lazy } from "lean-jsx/lib/server/components";
import { SXLGlobalContext } from "lean-jsx/src/types/context";

import {
    DynamicProductList,
    ProductList,
    ProductListLoading
} from "./products/product-list";

import { Nav } from "./components/nav";

function ProductListWrapper({
    productListStart,
    globalContext
}: {
    productListStart?: number;
    globalContext?: SXLGlobalContext;
}) {
    if (globalContext?.dynamicProductList) {
        console.log("Returning dynamic product list");
        return <DynamicProductList.Render />;
    }

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
    children
}: SXL.Props & { productListStart?: number } & {
    globalContext?: SXLGlobalContext;
}) {
    return (
        <div className="page">
            <Nav />
            <aside>
                <ProductListWrapper productListStart={productListStart} />
            </aside>
            <main>{children}</main>
        </div>
    );
}
