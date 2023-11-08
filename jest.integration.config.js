/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    rootDir: "./",
    projects: [
        {
            displayName: "Core",
            testEnvironment: "node",
            moduleNameMapper: {
                "^@tests/(.*)$": "<rootDir>/packages/core/tests/$1",
                "^@/(.*)$": "<rootDir>/packages/core/src/$1",
            },
            transform: {
                "^.+\\.tsx?$": [
                    "ts-jest",
                    { tsconfig: "<rootDir>/packages/core/tsconfig.json" },
                ],
            },
            testMatch: [
                "<rootDir>/packages/core/tests/e2e/**/*.test.ts",
                "<rootDir>/packages/core/tests/e2e/**/*.test.tsx",
            ],
        },
    ],
};
