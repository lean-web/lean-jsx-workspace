const fs = require("fs");
const glob = require("fast-glob");

function main() {
    const packageFiles = glob
        .sync("./packages/*/package.json")
        .map((pf) => fs.readFileSync(pf, "utf-8"))
        .map(JSON.parse)
        .map(({ name, version }) => ({ name, version }));

    console.log({ packageFiles });
}

main();
