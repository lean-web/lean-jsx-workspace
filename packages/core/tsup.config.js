import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        server: "src/server/express.ts",
        "server/components": "src/components/index.ts",
        "plugins/vite": "./src/plugins/vite/index.ts",
        "jsx/jsx-dev-runtime": "./src/jsx/core/jsx-dev-runtime.ts",
        "jsx/jsx-runtime": "./src/jsx/core/jsx-runtime.ts",
        "web/sxl": "./src/web/index.ts",
    },
    // outExtension({ options, format, pkgType }) {
    //     console.log({ options, format, pkgType });
    //     return {
    //         js: `.${format}.js`,
    //     };
    // },
    target: "es2018",
    format: ["esm", "cjs", "iife"],
    splitting: false,
    // sourcemap: true,
    clean: true,
    dts: true,
    globalName: "sxl",
    // cjsInterop: true,
});
