---
sidebar_position: 2
---

# Server-side JSX

LeanJSX takes advantage of the collocation of HTML and JavaScript and abstracts away all the setup needed to connect action handlers with elements.

LeanJSX relies on TypeScript to provide an implementation for JSX that doesn't rely on React for rendering.

Given JSX code like the following:

```jsx
function Home() {
    return <main>
            <h1>Title</h1>
            <p>Some text here</p>
        </main>
}
```

We can write HTTP server handlers like the following:

```jsx
// using Express:
app.use("/", async (req, res) => {
    // retrieve query parameters from the request
    const globalContext = parseQueryParams(req);

    // stream HTML into the response,
    // passing the data from query params
    await LeanEngine.renderWithTemplate(
        res,
        <Home />,
        globalContext,
        {
            // use a template for the
            // HTML page skeleton
            templateName: "index"
        }
    );
});
```

In this example, we're using a base template `index.html` with a placeholder where the contents of the response will be rendered:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A sample web app to test the capabilities of lean.jsx">
    <title>lean.jsx: Sample app</title>
    <link rel="stylesheet" href="./web/app.css">
    <script type="module" src="./web/app.js"></script>
    
  </head>
  <body>
    <!--EAGER_CONTENT-->
  </body>
</html>
```

In this example, `<!--EAGER_CONTENT-->` will be replaced with the HTML generated from `<Home/>`.

LeanJSX-generated projects use [Vite](https://vitejs.dev/) to pre-process and bundle client-side static resources like CSS and JavaScript, but `./web/app.js` itself has only logic needed for your application:

```js
// Add client-code here:
```

The actual response looks like this:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A sample web app to test the capabilities of lean.jsx">
    <title>lean.jsx: Sample app</title>
    <script type="module" crossorigin src="/assets/index-d796da6d.js"></script>
    <link rel="stylesheet" href="/assets/index-e50b81c3.css">
    <script src="/assets/injected_lean-jsx.js"></script>
  </head>
  <body>
    <main><h1>Title</h1><p>Some text here</p></main>
  </body>
</html>
```

The benefit of this approach is that, for static content no JavaScript is needed to render the JSX-defined contents, which considerably reduces **Time to First Byte (TTFB)** performance metrics.

Notice that the page includes a `/assets/injected_lean-jsx.js` script which isn't defined in the original template. This script is injected during the bundle process and includes a minimal set of JavaScript code which LeanJSX uses for **asynchronous components**.

## Nested components

LeanJSX components can pass props and children elements as in regular React components:

```tsx
interface MyProps extends SXL.Props {
    title:string;
}

export function Layout({ title, children }: MyProps) {
   return <>
        <h1>{title}<h1/>
        <div>{children}</div>
   </>
}

// usage:
<Layout title={'Page1'}>
    <p>Page contents</p>
</Layout>
```

When using TypeScript, the global namespace `SXL` is a more specific implementation of the `JSX` global namespace, and `SXL.Props` is the default type for all LeanJSX-based components.

## Asynchronous components

Server-defined components have the advantage of being close to data resources like databases and internal services. A JSX component can fetch data without relying on browsers making additional network requests.

LeanJSX components can be **asynchronous**, returning a Promise with a JSX element:

```jsx
async function Home() {
    const data = await fetchData();
    return <main>
            <h1>Title</h1>
            <p>{data.fetchedData}</p>
        </main>
}
```

We could just *await* for the component to fetch its data, but that would block any content that will render after it. If the first element in the page takes too long to load data, users may just stare at a blank page.

Instead, LeanJSX **defers** all async components by default: When the component is first evaluated, a **placeholder** will be immediately emitted, which unblocks the rendering of subsequent components. Once the async response finishes loading, its contents are emitted to the client, and LeanJSX replaces the original placeholder with the updated contents using JavaScript:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A sample web app to test the capabilities of lean.jsx">
    <title>lean.jsx: Sample app</title>
    
    <script type="module" crossorigin src="/assets/index-d796da6d.js"></script>
    <link rel="stylesheet" href="/assets/index-e50b81c3.css">
    <script src="/assets/injected_lean-jsx.js"></script>
  </head>
  <body>
    <div data-placeholder="element-0"></div>
    <!-- Elements after the async component will not be blocked -->
    <template id="element-0">
        <main>
            <h1>Title</h1>
            <p>This is async fetched data</p>
        </main>
    </template>
    <script>
        sxl.fillPlaceHolder("element-0");  
    </script>
  </body>
</html>
```

Let's review what happens here:

- When the server evaluates `<Home/>`, it detects that the component is async.
- `<div data-placeholder="element-0"></div>` is immediately sent to the response.
- While the async content is pending, rendering of other components continue.
- Once the async content completes, `<template id="element-0">...</template>` is sent to the client, along a small inline `<script>` which calls a single function: `sxl.fillPlaceHolder("element-0")`.
  - If the component defined any event handlers (like `onclick`), the handler code will also be emitted in this inline script tag, which allows the rendered component to be immediately **interactive**, even before the page finishes loading.
- As soon as the inline script tag is rendered in the browser, the placeholder is replaced with the contents of `<template>`.

### On inlined script tags

The idea of rendering inline JavaScript may sound like a bad practice, but it one huge benefit: Asynchronous components and any event handlers they define will be defined as soon as the component is rendered, without waiting for external scripts to load.

If instead of relying on inlined `<script>` elements we were to rely on independently loaded JavaScript bundles, asynchronous components and event handlers would only be available *after the whole page finishes loading*: `<script src="..."/>` elements are defered to avoid blocking rendering. Inline tags allows us to considerably improve [Time to interactive](https://developer.chrome.com/en/docs/lighthouse/performance/interactive/) performance metrics.

## Loading states

Async components as we defined in the previous example will emit an empty placeholder. This may not provide the best user experience, as it could lead to visible [reflow](https://developers.google.com/speed/docs/insights/browser-reflow).

A better experience would be to provide intermediate or "loading" content while the actual content is being calculated. This can be achieved in multiple ways in LeanJSX:

### Using the &lt;Lazy/&gt; helper

LeanJSX provides a `Lazy` component out-of-the box that allows developers to configure a loading state:

```jsx
<Lazy loading={<>Loading...</>}>
    <Home/>
</Lazy>
```

This is similar to how [React Suspense](https://react.dev/reference/react/Suspense) deals with loading states for components that need to await for asynchronous data to load.

In LeanJSX, `<Lazy/>` just adds content to the placeholder element:

```html
<div data-placeholder="element-0">Loading...</div>
<!-- Elements after the async component will not be blocked -->
<template id="element-0">
    <main>
        <h1>Title</h1>
        <p>This is async fetched data</p>
    </main>
</template>
```

### Using an async-generator component

For developers who need to control the loading state from within the same component that renders the final content, LeanJSX supports [async-generator-based](https://javascript.info/async-iterators-generators) components:

```jsx
async function* MyComponent() {
    yield (<>Loading</>);
    const data = await fetchData();
    return <main>
            <h1>Title</h1>
            <p>{data.fetchedData}</p>
        </main>
}
```

> Note: Currently, async-gen components only supporting one single `yield` statement for returning loading states and one `return` statement to return the final content. This may change in the future, if users report the need for more intermediate states.

## Class-based components

Finally, another approach to provide loading content is to create component-based components:

```jsx
class MyComponent {
    props: SXL.Props;

    constructor(props: SXL.Props) {
        this.props = props;
    }

    onLoading() {
        return <div>Loading...</div>;
    }

    async render() {
        const data = await fetchData()
        return <div>{data}</div>;
    }
}
```

By implementing the optional, non-asynchronous method `onLoading`, developers can indicate to LeanJSX to use this content as the placeholder for the asynchronous content.
