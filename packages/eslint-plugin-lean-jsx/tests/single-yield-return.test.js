const { RuleTester } = require("eslint");
const fooBarRule = require("../single-yield-return");

const ruleTester = new RuleTester({
    // Must use at least ecmaVersion 2015 because
    // that's when `const` variables were introduced.
    parserOptions: { ecmaVersion: "latest" }
    // parser: "@babel/eslint-parser"
});

async function* ComponentPasses() {
    yield "true";
    await Promise.resolve();
    return "false";
}

async function* ComponentFails() {
    yield "true";
    await Promise.resolve();
    yield "true";
    yield "true";
    return "false";
}

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
    "single-yield-return", // rule name
    fooBarRule, // rule code
    {
        // checks
        // 'valid' checks cases that should pass
        valid: [
            {
                code: ComponentPasses.toString()
            }
        ],
        // 'invalid' checks cases that should not pass
        invalid: [
            {
                code: ComponentFails.toString(),
                // output: ComponentPasses.toString(),
                errors: 2
            }
        ]
    }
);

console.log("All tests passed!");
