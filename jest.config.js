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
                "^@/(.*)$": "<rootDir>/packages/core/src/$1"
            },
            transform: {
                "^.+\\.tsx?$": [
                    "ts-jest",
                    { tsconfig: "<rootDir>/packages/core/tsconfig.json" }
                ]
            },
            testMatch: [
                "<rootDir>/packages/core/tests/unit/**/*.test.ts",
                "<rootDir>/packages/core/tests/integration/**/*.test.ts",
                "<rootDir>/packages/core/tests/unit/**/*.test.tsx",
                "<rootDir>/packages/core/tests/integration/**/*.test.tsx"
            ]
        }
    ]
};
