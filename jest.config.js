/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "./",
    collectCoverage: true,
    reporters: [
        "default",
        ["<rootDir>/packages/core/tests/reporters/slow-test", { numTests: 5 }],
    ],
    projects: ["packages/core", "packages/create-lean-jsx-app"],
};
