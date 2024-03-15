---
sidebar_position: 2
---

# Project structure

A LeanJSX project generated with `generator-lean-jsx` has the following structure:

```
.
├── .build
|   ├── build.cjs
|   ├── watch.cjs
├── build.cjs
├── package-lock.json
├── package.json
├── src
│   ├── components
│   │   ├── app.tsx
│   │   └── slow.tsx
│   ├── context.ts
│   ├── engine.ts
│   ├── express.tsx
│   ├── index.html
│   └── web
│       ├── app.css
│       ├── app.js
│       └── public
├── sxl.d.ts
└── tsconfig.json
```



### .build
The `.build` directory contains scripts for bundling the web application (`.build/build.cjs`) and to run the bundled server, watching for file changes `.build/watch.cjs`. Both of these files depend on the root file `build.cjs`, which contains the full bundling configuration.

All scripts use the CommonJS extension `cjs`, as the `product.json` is configured with `type: "module"`.

#### Bundling configuration

The configuration has two main sections: `web` and `server`. The `web` section provides [Vite's configuration](https://vitejs.dev/config/) for bundling `index.html`, and `server` the [esbuild configuration](https://esbuild.github.io/api/) for transpiling and bundling `express.tsx`.

```js
const conf = {
// The Vite configuration for the web part:
web: {
    root,
    publicDir: resolve(root, "./web/public"),
    build: {
        outDir,
        assetsDir: "assets",
        emptyOutDir: true
    },
    plugins: [injectScript("lean-jsx")]
},
// The configuration for the server part:
server: {
    // The path to the bundled server script:
    main: resolve(
        outDir,
        basename(main).replace(
            /\.(js|tsx?)/,
            bundledOutExtensionMap[extname(main)]
        )
    ),
    // The esbuild building configuration:
    esbuildOptions: {
        entryPoints: [main],
        platform: "node",
        bundle: true,
        outdir: resolve(__dirname, "./dist"),
        format: "cjs",
        external: [...Object.keys(packageConfig.dependencies)],
        outExtension,
        loader: {
            ".png": "dataurl",
            ".svg": "text"
        }
    }
}
```

### src/index.html

This is the main template skeleton. It defines a placeholder (`<!--EAGER_CONTENT-->`, by default) where JSX-defined content will be render.

This template is processed and bundled by Vite, and any scripts and CSS resources follow [Vite's bundling process](https://vitejs.dev/guide/build.html).

### src/express.tsx

The main entry point for the application. This file contains the definition of the Express server, along with all sample route handlers.

The file also includes an example of how to use LeanJSX's Express middleware for supporting [JavaScript loaded content](/docs/architecture/static-vs-dynamic#getdynamiccomponent).

### src/engine.ts

This scripts creates the instance of LeanJSX engine that will be used by `express.tsx`. It contains default startup configurations:

```ts
import { buildApp } from "lean-jsx/server";
import path from "path";

const INDEX_HTML_PATH = path.resolve(__dirname, "index.html");

const app = buildApp({
    templates: {
        index: {
            path: INDEX_HTML_PATH,
            contentPlaceholder: "<!--EAGER_CONTENT-->"
        }
    },
    logging: {
        defaultLogLevel: "info"
    }
});

export default app;
```

The **templates** section defines the list of all template skeletons that are available in the project, along with the configuration for the placeholder that will be replaced with JSX-defined content. More than one template can be configured; by default it creates a single template named `index`. This key is then referenced when rendering content in `express.tsx`:

```tsx
await LeanEngine.renderWithTemplate(
    res,
    <App />,
    globalContext,
    {
        // as defined in `engine.ts`
        templateName: "index"
    }
);
```

The `logging` section defines the configuration for the logging used. Out of the box, LeanJSX can be configured to store logs in independent files for each logging level. For instance, the following configuration stores errors in a text file:

```ts
logging: {
    defaultLogLevel: "info",
    file: {
        error: {
            destination: 'path/to/error/logfile.log'
        }
    }
}
```

Developers can get an instance of the logger directly from `LeanEngine`:

```ts
const logger = LeanEngine.logger({
    defaultLogLevel: "info"
});
```

### context.ts

This file overrides the [global context](/docs/architecture/state-and-context#global-context) namespace `lean-jsx/src/types/context` to allow developers to extend it and add their own type definitions to it.

It also provides a default function to parse query parameters and inject them into the global context. For more details on the global context, visit [its documentation page](/docs/architecture/state-and-context#global-context).

### sxl.d.ts

LeanJSX relies on the TypeScript global namespace `SXL` for type validation in JSX elements. The type definition `sxl.d.ts` imports this namespace, along with the types for intrinsic HTML elements.
