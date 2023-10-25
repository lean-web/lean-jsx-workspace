/**
 * ESLint rule to enforce a single yield and a single return in an async generator function.
 * @type {import("eslint").Rule.RuleModule}
 */
const rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Async Generator-based components should only yield once, for showing a loading state"
        },
        fixable: "code",
        schema: []
    },
    create(context) {
        return {
            FunctionDeclaration(node) {
                // Only interested in async generator functions
                if (!node.async || node.generator !== true) {
                    return;
                }

                // Variables to hold counts of yield and return statements
                let yieldCount = 0;
                let returnCount = 0;

                // Recursive function to explore node's body
                /**
                 *
                 * @param {import("estree").Node} node
                 * @returns
                 */
                function exploreBlock(node) {
                    if (!node) return;

                    if (node.type === "YieldExpression") {
                        yieldCount++;
                        if (yieldCount > 1) {
                            context.report({
                                node,
                                message:
                                    "Currently, Async-Generator based components only support" +
                                    " yielding loading state once."
                            });
                        }
                    } else if (node.type === "ReturnStatement") {
                        returnCount++;
                    }

                    if (node.type === "BlockStatement") {
                        node.body.forEach(b => exploreBlock(b));
                    } else if (node.type === "ExpressionStatement") {
                        exploreBlock(node.expression);
                    }
                }
                exploreBlock(node.body);
            }
        };
    }
};

module.exports = rule;
