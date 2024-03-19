import type { Request } from "express";
import type { RequestQueryParams } from "../context";
import {
    fetchProduct,
    fetchProducts,
    type Product,
} from "../services/products";
import {
    APIC,
    toQueryString,
    withClientData,
} from "lean-jsx/server/components";

function deleteProduct(id: string) {
    return withClientData({ id }, async function (ev, actions, data) {
        const container = (ev?.currentTarget as HTMLElement | null | undefined)
            ?.parentElement;

        const link = container?.querySelector("a");
        if (link) {
            link.href = "#";
        }

        container?.classList.add("product-loading");
        await fetch(`/product/${data.id}`, {
            method: "DELETE",
        });

        await actions.refetchAPIC("product-list", {});

        container?.classList.remove("product-loading");
    });
}

export function ProductListDetails({
    product,
    globalContext,
}: SXL.Props<{ product: Product }>) {
    return (
        <div className="product" ref={`menu-product-${product.id}`}>
            <a href={toQueryString(`/product/${product.id}`, globalContext)}>
                <h3>{product.name}</h3>
                <p>{product.description.slice(0, 50)}</p>
                <p>{new Date().toISOString()}</p>
            </a>

            <button
                onclick={withClientData(
                    { index: product.id },
                    (ev, actions, data) => {
                        if (!data) {
                            return;
                        }
                        const index = data.index;
                        if (index) {
                            void actions.replaceAPIC(
                                `menu-product-${index}`,
                                "product",
                                { id: index },
                                { onlyReplaceContent: false, noCache: true },
                            );
                        }
                    },
                )}
            >
                Reload product
            </button>
            <button onclick={deleteProduct(product.id)}>Delete</button>
        </div>
    );
}

APIC(
    {
        id: "product",
        requestHandler: (req) => ({
            productId: req.query?.id?.toString() ?? "",
        }),
        cache: "public, max-age=30",
    },
    async ({ productId }: { productId: string }) => {
        const product = await fetchProduct(productId);
        const index = productId;
        if (!product) {
            return <div className="product">No product</div>;
        }
        return (
            <div className="product" ref={`menu-product-${index}`}>
                <a href={toQueryString(`/product/${product.id}`)}>
                    <h3>{product.name}</h3>
                    <p>{product.description.slice(0, 50)}</p>
                    <p>{new Date().toISOString()}</p>
                </a>
                <button
                    onclick={withClientData({ index }, (ev, actions, data) => {
                        const index = data.index;
                        if (index) {
                            void actions.replaceAPIC(
                                `menu-product-${index}`,
                                "product",
                                { id: index },
                                { noCache: true },
                            );
                        }
                    })}
                >
                    Reload product
                </button>
                <button onclick={deleteProduct(product.id)}>Delete</button>
            </div>
        );
    },
);

/**
 * Product List: Async function version.
 *
 * Will create a placeholder element while its loading.
 * The content of the placeholder can be controlled using the <Lazy> component.
 *
 * @param param0
 * @returns
 */
export async function* ProductList_({
    start,
}: { start: number } & { globalContext?: RequestQueryParams }) {
    yield <ProductListLoading />;
    const products = await fetchProducts(start, 10, 300);
    return (
        <div id="product-list">
            <h2>Products</h2>
            <ul className="product-list">
                {products.map((product, index) => (
                    <li>
                        <ProductListDetails product={product} />
                    </li>
                ))}
                {products.length === 0 && <li>Empty List</li>}
            </ul>
        </div>
    );
}

export const ProductList = APIC<{ start: number }, SXL.AsyncGenElement>(
    { id: "product-list", requestHandler: (_req) => ({ start: 0 }) },
    ProductList_,
);

export const Something = APIC(
    {
        id: "hello",
        requestHandler: function (
            _req: Request,
        ): Record<string, string | number | boolean> {
            return {};
        },
    },
    () => {
        return <div>Hello</div>;
    },
);

export function SomethingElse() {
    return (
        <div>
            <Something id="" />
        </div>
    );
}

/**
 * The loading
 * @returns
 */
export function ProductListLoading() {
    return (
        <div id="product-list">
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
// export const DynamicProductList = GetDynamicComponent(
//     "product-list2",
//     () => fetchProducts(0, 10, 300),
//     (maybeResource) => {
//         if (maybeResource.isResolved) {
//             const products = maybeResource.value;
//             return (
//                 <div>
//                     <h2>Products</h2>
//                     <ul className="product-list">
//                         {products.map((product) => (
//                             <li>
//                                 <ProductListDetails product={product} />
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             );
//         }
//         return <ProductListLoading />;
//     },
// );
