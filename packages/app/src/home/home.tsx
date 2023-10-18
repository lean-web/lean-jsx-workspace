import { Layout } from "../layout";
import logo from "@/web/public/logo.svg";

interface HomeParams {
    productIndexStart?: number;
    selectedProduct?: string;
}

export function Home({ productIndexStart }: HomeParams) {
    return (
        <Layout productListStart={productIndexStart}>
            <h1>Welcome</h1>

            <p>Choose a product to start</p>

            {logo}
        </Layout>
    );
}
