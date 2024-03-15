---
sidebar_position: 3
---

# Create a new page

Creating a new page is very simple. Just declare a new handler for the Express server and render some JSX content using LeanJSX's engine:

```jsx
app.get("/about", async (req, res) => {
    await LeanApp.render(
        res,
        <main>
            <h1>About</h1>
            <p>This is a simple page</p>
        </main>,
    );
});
```

The `LeanApp.render` function will use by default the template registered as `index` in LeanJSX's `buildApp`:

```jsx
import { buildApp } from "lean-jsx/server";
import path from "path";

const INDEX_HTML_PATH = path.resolve(__dirname, "index.html");

const app = buildApp({
    templates: {
        index: {
            path: INDEX_HTML_PATH,
            contentPlaceholder: "<!--EAGER_CONTENT-->",
        },
    },
    logging: {
        defaultLogLevel: "info",
    },
});
```

To override the template used for rendering this page, we can pass the `templateName` to `render`:

```jsx
app.get("/about", async (req, res) => {
    await LeanApp.render(
        res.set("Content-Security-Policy", CSP),
        <main>
            <h1>About</h1>
            <p>This is a simple page</p>
        </main>,
        {templateName: 'mytemplate'}
    );
});
```

## Passing global context

All LeanJSX receive by default a reference to the global context `SXLGlobalContext`, but it needs to be retrieved from the server's request first:


```jsx
app.get("/about", async (req, res) => {
    const globalContext = parseQueryParams(req);
    await LeanApp.render(
        res.set("Content-Security-Policy", CSP),
        <App />,
        {
            globalContext
        }
    );
});
```

The `parseQueryParams` function is defined in a new LeanJSX project inside `context.ts`, (were the type definition for `SXLGlobalContext` can be extended):

```jsx
export interface RequestQueryParams {
    someQueryParam?: boolean;
}

declare module "lean-jsx/src/types/context" {
    interface SXLGlobalContext extends RequestQueryParams {}
}

export function parseQueryParams(req: Request): RequestQueryParams {
    return {
        someQueryParam: Boolean(req.query?.someQueryParam)
    };
}
```

Now any LeanJSX component can retrieve the global context without passing it as a prop:


```jsx
function MyComponent(props: SXL.Props) {
    const { globalContext } = props;
    return <>...</>
}

// ...
// No props:
<MyComponent/>
```

For more information on global and local states, check our [architecture section](/docs/architecture/state-and-context#global-context).
