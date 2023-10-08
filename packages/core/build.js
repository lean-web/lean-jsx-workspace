import { build, defineConfig } from "vite";
import { resolve, dirname } from "path";
import dts from "vite-plugin-dts";
import packageConfig from "./package.json" assert { type: "json" };
import * as url from "url";
const __filename = dirname(url.fileURLToPath(import.meta.url));

const web = defineConfig({
    build: {
        target: "es2018",
        outDir: "dist/web",
        lib: {
            entry: "./src/web/index.ts",
            name: "sxl",
            fileName: "sxl",
            formats: ["es", "iife", "umd"],
        },
        emptyOutDir: true,
    },
});

const vite = defineConfig({
    build: {
        target: "esnext",
        outDir: "dist/plugins",
        lib: {
            entry: "./src/plugins/vite/index.ts",
            name: "vite-plugins",
            fileName: "vite",
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: (id) => /^node:/.test(id) || /node_modules/.test(id),
        },
        emptyOutDir: true,
    },
});

const jsx = defineConfig({
    build: {
        target: "es2018",
        outDir: "dist/jsx",
        lib: {
            entry: {
                "jsx-dev-runtime": "./src/jsx/core/jsx-dev-runtime.ts",
                "jsx-runtime": "./src/jsx/core/jsx-runtime.ts",
            },
            // name: "runtime",
            // fileName: "runtime",
            formats: ["es", "cjs"],
        },
        emptyOutDir: true,
    },
    plugins: [dts({ rollupTypes: true })],
});

const server = defineConfig({
    resolve: {
        alias: {
            "@/jsx/core/jsx-runtime": "./src/jsx/core/jsx-runtime.ts",
        },
    },
    build: {
        target: "es2018",
        outDir: "dist/server/",
        lib: {
            entry: "./src/server/express.ts",
            // entry: resolve(__filename, "./src/server/express.ts"),
            formats: ["es", "cjs"],
            fileName: "express",
        },
        rollupOptions: {
            input: {
                express: "./src/server/express.ts",
            },
            external: (id) =>
                /^node:/.test(id) ||
                /node_modules/.test(id) ||
                /^(stream|body-parser)/.test(id) ||
                packageConfig.dependencies[id],
        },
        emptyOutDir: true,
    },
    plugins: [
        dts({
            rollupTypes: true,
        }),
    ],
});

// const serverComponents = defineConfig({
//     resolve: {
//         alias: {
//             "@/jsx/core/jsx-runtime": "./src/jsx/core/jsx-runtime.ts",
//         },
//     },
//     build: {
//         target: "esnext",
//         outDir: "dist/server/components",
//         lib: {
//             entry: "./src/components/index.ts",
//             formats: ["es", "cjs"],
//             fileName: "express",
//         },
//         rollupOptions: {
//             external: (id) =>
//                 /^node:/.test(id) ||
//                 /node_modules/.test(id) ||
//                 /^(stream)/.test(id) ||
//                 packageConfig.dependencies[id],
//         },
//     },
//     plugins: [dts({ rollupTypes: true })],
// });

console.log("========= WEB =========");
build(web);
console.log("========= Plugins =========");
build(vite);
console.log("========= JSX =========");
build(jsx);
console.log("========= SERVER =========");
build(server);
// build(serverComponents);
//tsc --emitDeclarationOnly --declaration ./src/context/index.ts --outDir ./dist/types --types ./src/types/global.d.ts
