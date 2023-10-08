import { defineConfig } from "vite";
import { resolve, relative, extname } from "path";
import fs from "fs";
import { injectScript } from "@sxl/core/dist/plugins/vite";
// import dts from "vite-plugin-dts";
import packageConfig from "./package.json";

export default defineConfig({
    // assetsInclude: ["**/*.css"],
    assetsDir: "assets",
    appType: "custom",
    root: "./src",
    publicDir: "./src/web/public",
    build: {
        manifest: true,
        ssr: true,
        ssrEmitAssets: true,
        target: "esnext",
        assetsDir: "assets",
        outDir: resolve(__dirname, "./dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                express: "./src/express.tsx",
                "assets/web": "./src/index.html",
            },
            output: {
                entryFileNames: "[name].js",
                // format: "cjs",
            },
            external: [
                /^(node:|fs|stream|express|path).*/,
                /node_modules.*/,
                /@sxl\\..*/,
                ...Object.keys(packageConfig.dependencies),
            ],
        },
    },
    // experimental: {
    //     renderBuiltUrl(filename, { hostId, hostType, type, ...rest }) {
    //         console.log({ hostId, hostType, type, ...rest });
    //         if (type === "public") {
    //             return "https://www.domain.com/" + filename;
    //         } else if (extname(hostId) === ".js") {
    //             return {
    //                 runtime: `window.__assetsPath(${JSON.stringify(filename)})`,
    //             };
    //         } else {
    //             return "https://cdn.domain.com/assets/" + filename;
    //         }
    //     },
    // },

    plugins: [
        injectScript(
            "@sxl/core",
            "dist/web/sxl.global.js",
            "../../node_modules"
        ),
        // {
        //     name: "html-transform",
        //     // options(opts) {
        //     //     console.log("opts", opts);
        //     // },
        //     // async resolveDynamicImport(specifier, importer, options) {
        //     //     if (specifier.includes(".html")) {
        //     //         const resolution = await this.resolve(
        //     //             specifier,
        //     //             importer,
        //     //             options
        //     //         );
        //     //         // return null;
        //     //         const moduleInfo = await this.load(resolution);
        //     //         const self = this;
        //     //         console.log({
        //     //             specifier,
        //     //             importer,
        //     //             options,
        //     //             resolution,
        //     //             moduleInfo,
        //     //             exports: moduleInfo.exports,
        //     //         });
        //     //         console.log({ ...moduleInfo });
        //     //         // moduleInfo.hasDefaultExport = true;
        //     //         moduleInfo.exports.push(
        //     //             'export default const hello = "j";'
        //     //         );
        //     //         return "./html-resolver.js";
        //     //     }
        //     // },
        //     // async transform(source, importer, options) {
        //     //     if (importer.includes("./html")) {
        //     //         console.log({ source, importer, options });
        //     //     }
        //     // },
        //     resolveId(source) {
        //         console.log("resolveId", { source });
        //         if (source === "my-dependency") {
        //             return { id: "my-dependency-develop", external: true };
        //         }
        //         return null;
        //     },
        //     load(id) {
        //         if (id.includes(".html")) {
        //             console.log("load", { id });
        //             const htmlContent = fs.readFileSync(id, "utf-8");
        //             console.log({ htmlContent });
        //             // const htmlContent = fs.readFileSync(id, "utf-8");
        //             // const assetId = this.emitFile({
        //             //     type: "prebuilt-chunk",
        //             //     fileName: id,
        //             //     source: htmlContent,
        //             // });
        //             const assetId = this.emitFile({
        //                 type: "prebuilt-chunk",
        //                 fileName: "view.html",
        //                 code: htmlContent,
        //             });
        //             this.emitFile({
        //                 type: "prebuilt-chunk",
        //                 fileName: "x.js",
        //                 code: 'console.log("x");',
        //             });
        //             return htmlContent;
        //         }
        //     },
        //     // return {
        //     //     code: `export default import.meta.ROLLUP_FILE_URL_${assetId};`,
        //     // };
        //     // return htmlContent;
        //     //     }
        //     //     // load(id) {
        //     //     //     if (id.endsWith(".html")) {
        //     //     //         console.log({ id });
        //     //     //         const htmlContent = fs.readFileSync(id, "utf-8");
        //     //     //         return htmlContent;
        //     //     // const html = {
        //     //     //     content: htmlContent,
        //     //     //     fileName: id,
        //     //     // };
        //     //     // console.log(`export default ${JSON.stringify(html)}`);
        //     //     // // Transform the HTML if necessary
        //     //     // // For this example, let's just return the HTML string as a JavaScript string
        //     //     // return `export const html = \`${htmlContent}\`;`;
        //     //     // return `export default ${JSON.stringify(html)}`;
        //     //     // }
        //     // },
        //     transformIndexHtml: {
        //         order: "pre",
        //         handler: function (src, ctx, bundle) {
        //             const self = this;
        //             console.log("pre", { src, ctx, bundle });
        //             return {
        //                 // html: src.replace('src="./app.js"', 'src="../app.js"'),
        //                 html: src,
        //                 tags: [],
        //                 // tags: [
        //                 //     {
        //                 //         tag: "p",
        //                 //         injectTo: "body",
        //                 //     },
        //                 // ],
        //             };
        //         },
        //     },
        //     // transformIndexHtml: {
        //     //     order: "post",
        //     //     handler: function (src, ctx) {
        //     //         console.log({ src, ctx });
        //     //         return {
        //     //             html: src,
        //     //             tags: [
        //     //                 {
        //     //                     tag: "p",
        //     //                     injectTo: "body",
        //     //                 },
        //     //             ],
        //     //         };
        //     //     },
        //     // },
        //     transform(src, id, opts) {
        //         const self = this;
        //         if (id.endsWith(".html")) {
        //             console.log({ src, id, opts });
        //             return {
        //                 code: src,
        //                 map: null, // provide source map if available
        //             };
        //         }
        //     },
        // },
    ],
    //   plugins: [dts({ rollupTypes: true, exclude: ["./src/tests"] })],
});
