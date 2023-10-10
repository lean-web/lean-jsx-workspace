import fs from "node:fs";
import { resolve } from "node:path";
import { Plugin } from "vite";
import * as g from "@sxl/core/dist/web/sxl.global.js";

export default function injectScript(packageName: string): Plugin {
    return {
        name: "vite-plugin-inject-script",
        apply: "build",
        transformIndexHtml: {
            enforce: "post",
            transform(html, context) {
                if (context.bundle) {
                    const injectedFileName = Object.keys(context.bundle).find(
                        (key) => /injected_/.test(key)
                    );
                    //   context.
                    if (injectedFileName) {
                        return {
                            html,
                            tags: [
                                {
                                    tag: "script",
                                    attrs: { src: injectedFileName },
                                    injectTo: "head",
                                },
                            ],
                        };
                    }
                }
                console.warn("No script to inject was found in the bundle");
            },
        },
        generateBundle(options) {
            // Read the script content from the package
            const scriptContent = fs.readFileSync(
                require.resolve("@sxl/core/dist/web/sxl.global.js"),
                "utf-8"
            );

            // Create an injected script asset
            // TODO: Get assets dir from config
            const injectedFileName = options.sanitizeFileName(
                `assets/injected_${packageName}.js`
            );

            this.emitFile({
                type: "prebuilt-chunk",
                fileName: injectedFileName,
                code: scriptContent,
            });
        },
    };
}
