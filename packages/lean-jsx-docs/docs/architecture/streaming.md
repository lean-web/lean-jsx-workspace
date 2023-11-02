---
sidebar_position: 3
---

# HTTP streaming

[Chunked Transfer Encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) or HTTP streaming has been available since HTTP 1.1. However, most web frameworks -either server-driven or SSR-based- don't fully take advantage of this feature by default. Developers need to explicitely configure their endpoint handlers to provide a streamed response.

HTTP streaming allows HTTP servers to return a response to the client in *chunks* or parts:

```js
app.all('/', function (req, res, next) {

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  })

  res.write('<body>');
  res.write('<h1>Title</h1>');
  // ...
  res.write('</body>')

  res.end()
  next()
});
```

The browser then can start rendering chunks as it receives them, instead of waiting for the whole HTML response to be computed and sent. This has great performance implication, as users can see content (and [interact with it if the JavaScript is already available](/docs/architecture/components#on-inlined-script-tags)).

By default, LeanJSX returns all JSX-based content with `Chunked Transfer Encoding`, which means that components will be rendered as they are computed.

Let's take another look at the server route handler:

```jsx
// using Express:
app.use("/", async (req, res) => {
    // ...
    await LeanEngine.renderWithTemplate(
        res,
        <Home />,
        // ...options
    );
});
```

The method `LeanEngine.renderWithTemplate` receives the `Response` object. Then, internally LearnJSX computes all JSX content and produces a [NodeJS Readable stream](https://nodejs.org/api/stream.html#readable-streams) which in turn is piped to the `Response`.

![Activity diagram showing how JSX components are streamed one by one directly to the browser](/img/rendering-diagram.png)

**Rendering will only be blocked for non-asynchronous, slow loading components**.

## Are nested components streamed correctly?

Yes, browsers can handle rendering nested components in chunks. This is why we can return `<body>` first, then all the page contents and only send the closing `</body>` at the end.

In the next section, we will discuss how interactivity works in this chunked-response environment.
