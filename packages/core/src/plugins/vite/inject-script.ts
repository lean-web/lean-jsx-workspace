import fs from "node:fs";
import { resolve } from "node:path";
import { Plugin } from "vite";

export default function injectScript(
    packageName: string,
    filePath: string,
    node_modules?: string
): Plugin {
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
                        return html.replace(
                            "</head>",
                            `<script src="/${injectedFileName}"></script></head>`
                        );
                    }
                }
                console.warn("No script to inject was found in the bundle");
            },
        },
        generateBundle(options, bundle) {
            const scriptPath = resolve(
                node_modules ?? "node_modules",
                packageName,
                filePath
            );

            if (!fs.existsSync(scriptPath)) {
                throw new Error(
                    `Could not find the script to be injected: ${scriptPath}`
                );
            }
            // Read the script content from the package
            const scriptContent = fs.readFileSync(scriptPath, "utf-8");

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

            // Find the HTML assets in the bundle
            for (const [name, asset] of Object.entries(bundle)) {
                if (name.endsWith(".html")) {
                    if (
                        asset.type === "asset" &&
                        typeof asset.source === "string"
                    ) {
                        asset.source = asset.source.replace(
                            "</head>",
                            `<script src="${injectedFileName}"></script></head>`
                        );
                    }
                }
            }
        },
    };
}
