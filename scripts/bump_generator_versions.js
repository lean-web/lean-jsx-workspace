const fs = require("fs");
const glob = require("fast-glob");

const GENERATOR_DEPENDENCIES = [
    "lean-jsx",
    "lean-jsx-types",
    "eslint-plugin-lean-jsx",
];
const GENERATOR_VERSIONS_FILE = "packages/create-lean-jsx-app/versions.json";

function main() {
    const packageFiles = glob
        .sync("./packages/*/package.json")
        .map((pf) => fs.readFileSync(pf, "utf-8"))
        .map(JSON.parse)
        .map(({ name, version }) => ({ name, version }))
        .filter((dep) => GENERATOR_DEPENDENCIES.includes(dep.name))
        .reduce((acc, el) => ({ ...acc, [el.name]: el.version }), {});

    console.log({ packageFiles });

    fs.writeFileSync(
        GENERATOR_VERSIONS_FILE,
        JSON.stringify(packageFiles, null, 2),
    );
}

main();
