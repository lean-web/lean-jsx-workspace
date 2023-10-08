import { faker } from "@faker-js/faker";

export interface Review {
    username: string;
    content: string;
    created: Date;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    reviews: Review[];
}

const getReviews = (count: number): Review[] => {
    return new Array(faker.helpers.rangeToNumber({ min: 0, max: count }))
        .fill(true)
        .map(() => ({
            username: faker.internet.userName(),
            content: faker.lorem.paragraphs(2),
            created: faker.date.anytime(),
        }));
};

const allProducts: Product[] = new Array(100).fill(true).map((_, index) => ({
    id: `p${index}`,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    reviews: getReviews(15),
}));

async function wait(timeInMillis: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeInMillis);
    });
}

export async function fetchProducts(
    start: number,
    count: number,
    timeout?: number
) {
    await wait(timeout ?? 1500);
    return allProducts.slice(start, start + count);
}

export async function fetchProduct(productId: string) {
    await wait(300);
    return allProducts.find((p) => p.id === productId);
}
