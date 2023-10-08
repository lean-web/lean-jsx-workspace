import { Layout } from "../layout";
import { fetchProduct } from "../services/products";

async function ProductDetails({ productId }: { productId: string }) {
    const product = await fetchProduct(productId);

    if (!product) {
        return <div>No product found</div>;
    }
    //

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            {/* <img src="/img1.jpg" style={{ width: "100%" }} /> */}
        </div>
    );
}

export function ProductDescription({
    productIndexStart,
    productId,
}: {
    productIndexStart?: number;
    productId: string;
}) {
    return (
        <Layout productListStart={productIndexStart}>
            <ProductDetails productId={productId} />
        </Layout>
    );
}
