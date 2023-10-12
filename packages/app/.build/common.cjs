const { resolve, basename, extname } = require("path");
const { injectScript } = require("lean-jsx/dist/plugins/vite");
const packageConfig = require("../package.json");

module.exports = {
    async getConfig() {
        const ROOT = resolve(__dirname, "../");

        const config = (await import("../build.js")).default;
        const web = config.web ?? {};
        const root = web.root ?? resolve(ROOT, "./src");
        const outDir = web.build?.outDir ?? resolve(ROOT, "./dist");
        const plugins = web.plugins ?? [];
        const emptyOutDir = web.build?.emptyOutDir ?? true;

        const outExtension = config.server.esbuildOptions?.outExtension ?? {
            ".js": ".cjs",
        };
        const actualOutExtension = {
            ".tsx": outExtension[".js"],
            ".ts": outExtension[".js"],
            ".js": outExtension[".js"],
        };
        const esbuildOptions = config.server?.esbuildOptions ?? {};

        /**  @type {import("lean-jsx/src/types/build").default} */
        const conf = {
            web: {
                root,
                publicDir: resolve(root, "./web/public"),
                build: {
                    outDir,
                    assetsDir: "assets",
                    emptyOutDir,
                },
                plugins: [injectScript("lean-jsx"), ...plugins],
            },
            server: {
                main: resolve(
                    ROOT,
                    "./dist",
                    basename(config.server.main).replace(
                        /\.(js|tsx?)/,
                        actualOutExtension[extname(config.server.main)]
                    )
                ),
                esbuildOptions: {
                    entryPoints: [resolve(ROOT, config.server.main)],
                    platform: "node",
                    bundle: true,
                    outdir: resolve(ROOT, "./dist"),
                    format: "cjs",
                    external: [...Object.keys(packageConfig.dependencies)],
                    outExtension,
                    ...esbuildOptions,
                },
                // write: false,
            },
        };
        return conf;
    },
};
