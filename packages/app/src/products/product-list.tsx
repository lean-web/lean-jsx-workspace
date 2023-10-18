import { RequestQueryParams } from "../context";
import { fetchProducts, Product } from "../services/products";
import {
    GetDynamicComponent,
    toQueryString
} from "lean-jsx/dist/server/components";

export function ProductListDetails({
    product,
    globalContext
}: { product: Product } & { globalContext?: RequestQueryParams }) {
    return (
        <a
            href={toQueryString(`/product/${product.id}`, globalContext)}
            className="product"
        >
            <h3>{product.name}</h3>
            <p>{product.description.slice(0, 50)}</p>
        </a>
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
    start
}: { start: number } & { globalContext?: RequestQueryParams }) {
    const products = await fetchProducts(start, 10, 3000);
    return (
        <div>
            <h2>Products</h2>
            <ul className="product-list">
                {products.map(product => (
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
    () => fetchProducts(0, 10, 3000),
    maybeResource => {
        if (maybeResource.isResolved) {
            const products = maybeResource.value;
            return (
                <div>
                    <h2>Products</h2>
                    <ul className="product-list">
                        {products.map(product => (
                            <li>
                                <ProductListDetails product={product} />
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        return <ProductListLoading />;
    }
);
