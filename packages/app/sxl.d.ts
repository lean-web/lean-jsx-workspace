/// <reference types="lean-jsx-types/lib/global" />
/// <reference lib="dom" />
/// <reference types="svelte" />


/**
 * Add TypeScript support for custom imported types.
 */
declare module "*.svg" {
    const content: string;
    export default content;
}
