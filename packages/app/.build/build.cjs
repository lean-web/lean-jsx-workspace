const { build } = require("esbuild");
const packageConfig = require("../package.json");
const { resolve } = require("path");
const { build: viteBuild } = require("vite");
const { injectScript } = require("lean-jsx/dist/plugins/vite");
const { getConfig } = require("./common.cjs");

const ROOT = resolve(__dirname, "../");

async function buildApp() {
    const conf = await getConfig();
    await viteBuild(conf.web);
    await build(conf.server.esbuildOptions);
}

buildApp();
