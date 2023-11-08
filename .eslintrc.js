/* eslint-env node */
module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
    ],
    root: true,
    env: {
        browser: true,
        node: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
            "./packages/core/tsconfig.json",
            "./packages/app/tsconfig.json",
        ],
    },
    plugins: ["@typescript-eslint", "eslint-plugin-lean-jsx"],
    root: true,
    rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                ignoreRestSiblings: true,
                varsIgnorePattern: "_",
                argsIgnorePattern: "_",
            },
        ],
        "@typescript-eslint/ban-types": "warn",
        "@typescript-eslint/no-namespace": "warn",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "lean-jsx/single-yield-return": "error",
        "lean-jsx/no-outer-scope-in-handlers": "error",
    },
};
