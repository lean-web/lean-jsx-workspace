import type { RequestQueryParams } from "../context";
import { fetchProducts, type Product } from "../services/products";
import {
    GetDynamicComponent,
    toQueryString,
    webAction,
} from "lean-jsx/lib/server/components";

function deleteProduct(id: string) {
    return webAction({ id }, async function (ev, ctx) {
        const container = (ev?.currentTarget as HTMLElement | null | undefined)
            ?.parentElement;

        const link = container?.querySelector("a");
        if (link) {
            link.href = "#";
        }

        container?.classList.add("product-loading");
        await fetch(`/product/${ctx?.data.id}`, {
            method: "DELETE",
        });

        await ctx?.actions.refetchElement("product-list", {});

        container?.classList.remove("product-loading");
    });
}

export function ProductListDetails(
    this: { id: string },
    {
        product,
        globalContext,
    }: { product: Product } & { globalContext?: RequestQueryParams },
) {
    return (
        <div className="product">
            <a href={toQueryString(`/product/${product.id}`, globalContext)}>
                <h3>{product.name}</h3>
                <p>{product.description.slice(0, 50)}</p>
            </a>
            <button onclick={deleteProduct(product.id)}>Delete</button>
        </div>
    );
}

/**
 * Product List: Async function version.
 *
 * Will create a placeholder element while its loading.
 * The content of the placeholder can be controlled using the <Lazy> component.
 *
 * @param param0
 * @returns
 */
export async function ProductList({
    start,
}: { start: number } & { globalContext?: RequestQueryParams }) {
    const products = await fetchProducts(start, 10, 300);
    return (
        <div>
            <h2>Products</h2>
            <ul className="product-list">
                {products.map((product) => (
                    <li>
                        <ProductListDetails product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * The loading
 * @returns
 */
export function ProductListLoading() {
    return (
        <div>
            <h2>Products</h2>
            <ul className="product-list">
                {new Array(10).fill(true).map(() => (
                    <li>
                        <div className="product">
                            <h3 className="loading"></h3>
                            <p className="loading"></p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Product List: Async component version.
 * Will load asynchronously using JavaSCript.
 */
export const DynamicProductList = GetDynamicComponent(
    "product-list",
    () => fetchProducts(0, 10, 300),
    (maybeResource) => {
        if (maybeResource.isResolved) {
            const products = maybeResource.value;
            return (
                <div>
                    <h2>Products</h2>
                    <ul className="product-list">
                        {products.map((product) => (
                            <li>
                                <ProductListDetails product={product} />
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        return <ProductListLoading />;
    },
);
