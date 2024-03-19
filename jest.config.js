/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "./",
    collectCoverage: true,
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
    reporters: [
        "default",
        ["<rootDir>/packages/core/tests/reporters/slow-test", { numTests: 5 }],
    ],
    projects: [
        "packages/core",
        "packages/lean-web-utils",
        "packages/create-lean-jsx-app",
    ],
};
