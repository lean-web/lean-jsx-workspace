/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    verbose: true,
    preset: "ts-jest",
    moduleNameMapper: {
        "^@tests/(.*)$": "<rootDir>/tests/$1",
        "^@/(.*)$": "<rootDir>/src/$1"
    }
    // transform: {
    //   "\\.[jt]sx?$": "tsc",
    //   "\\.css$": "some-css-transformer",
    // },
};
export default config;
