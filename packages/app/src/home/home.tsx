import { Layout } from "../layout";
import logo from "@/web/public/logo.svg";

interface HomeParams {
    productIndexStart?: number;
    arg2: string;
    selectedProduct?: string;
}

export function Home({ productIndexStart, arg2 }: HomeParams) {
    return (
        <Layout productListStart={productIndexStart}>
            <h1>Welcome</h1>

            <p>Choose a product to start: {arg2}</p>

            <form
                method="POST"
                action="/product"
                onsubmit={(ev) => {
                    ev.preventDefault();
                    return false;
                }}
            >
                <button type="submit">Add to cart</button>
            </form>
            {logo}
        </Layout>
    );
}
