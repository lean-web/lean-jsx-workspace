---
sidebar_position: 4
---

# Static and dynamic content

> *Work in progress. Support for updating dynamic content after the page is loaded is currently on process, which means that dynamic behavior post page load needs to be manually implemented by developers.*
>
> *While LeanJSX doesn't require frameworks like React or Vue for base rendering, it doesn't prohibit their use: Developers can still use these tools to define fully-dynamic content.*
>
> *The advantage of using these frameworks on top of LeanJSX is that developers can implement dynamic behavior only where it's needed, instead of making the whole application dynamic by default.*
>
> *All frameworks support managing only small parts of the application, but some like [Svelte](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Svelte_getting_started) are particularly good for these use cases.*

Most content in web applications can be categorized in two:

- **Static content**: Content that will not change during the lifetime of a single page load. Some characteristics of static content are:
  - Content is only rendered once. To update it, users need to refresh the page or navigate back and forth.
  - It *can* be interactive (e.g. navigation or menu items), but the interactivity performed is within the scope of traditional HTML pages: content that changes state using CSS (e.g. hover) and default HTML behavior (navigation using links).
  - Examples of this content can be articles, blog posts, navigation menus, and so on.
- **Dynamic content**: Content that changes during the lifetime of a single page load, commonly as the result of an action performed by a user or by content pushed by the server (e.g. web sockets).

Traditional server-oriented web frameworks by default treat all content as static content. On the other side, JavaScript frameworks like React treat all content as dynamic content.

Modern JavaScript frameworks perform a lot of internal optimizations to avoid re-rendering static content, but developers can easily make mistakes that cause static content to be re-rendered when not needed.

LeanJSX assumes that all content is static, unless it is explicitely configured to be dynamic by default.

## Dynamic content use cases

The most common use case for dynamic content is to update page content *after* the page finishes loading. By defering heavy or slow data computation to asynchronous network calls, SPAs optimize for initial rendering.

With its support of defered asynchronous, static content loading, LeanJSX avoids relying on JavaScript to update content after page load. However, LeanJSX offers one utility to support JavaScript-based lazy loading of content: `GetDynamicComponent`.

### GetDynamicComponent

Even when asynchronous components avoid blocking rendering by emitting placeholders, events like `DOMContentLoaded` and `load` will not be triggered until the whole page loads. If developers rely on these events to render dynamic content (e.g. render JavaScript-frameworks-based components or native web components), blocking them could lead to poor user experience.

When the page needs to be marked as rendered but slow-loading static content needs to be supported, developers can create JavaScript-rendered static content with `GetDynamicComponent`:

```jsx
export const JSComponent = GetDynamicComponent(
    "dynamic-slow",
    async () => {
        await wait(100);
        return "Slow resource";
    },
    resource => {
        if (resource.isPending) {
            return <p id="loading2">Loading...</p>;
        }
        return <p id="loaded2">{resource.value}</p>;
    }
);
```

`GetDynamicComponent` generates two distinct server-side handlers: A non-blocking, stream-based component that can be used directly in other JSX components:

```jsx
function App() {
    return (
        <main>
            <h1>Title</h1>
            <JSComponent.Render />
        </main>
    );
}
```

And one blocking, API-oriented handler for the server to expose as an endpoint:

```js
// using LeanJSX middleware:
app.use(
    LeanEngine.middleware({
        components: [JsComponent],
        globalContextParser: () => ({})
    })
);
```

These two handlers in conjunction, perform the following actions:

- The content returned when `resource.isPending` is `true` is streamed directly to the response when `<JSComponent.Render />` is evaluated as a **placeholder**.
- The rest of the contents are streamed to the response, without waiting for `JSComponent`'s full response.
- In parallel, `JSComponent` is rendered inside a [LeanJSX-managed](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) web component that performs the following steps using JavaScript:
  - The server evaluates `JSComponent` **synchronously** (which means that `resource.isPending` will be `false`) and returns pure HTML.
  - Request the actual contents of `JSComponent` by making a network request to the server.
  - Once the request completes, it replaces the placeholder with the response from the API request.

![Activity diagram showing how JavaScript-based content is fetched after page finishes loading](/img/js-content-diagram.png)

How is this different from just using React or any other framework directly?

- Unlike common JS framework flows, the async API request returns **HTML**, instead of data content like JSON. Then, the whole placeholder is replaced. This approach allows us to avoid having to track internal state for `JSComponent` and building the content on the browser. The DOM update can be done efficiently.
- The API endpoint setup is done by LeanJSX's middleware. Developers can just pass the instance of `JSComponent` and all the wiring between the client-side component and the API is done automatically.
- Not state-tracking for each component. LeanJSX deals with pure HTML, which means that no virtual DOM or similar constructs are needed. this improves rendering performance, but requires specific patterns to retain [application state and context](/docs/architecture/state-and-context).

With these approaches to render content, LeanJSX allows high-performance, asynchronous rendering without having to rely on memory and network intensive, browser-side rendering.
