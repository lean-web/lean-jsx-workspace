---
sidebar_position: 1
---

# What's the problem with JavaScript frameworks?

Probably you have heard the quote _You don't need a JavaScript framweork for that!_.

There is nothing inherently wrong with JavaScript frameworks. However, for all their benefits, JavaScript frameworks have their downsides:

- **Slow time-to-first-paint**: JavaScript frameworks render all HTML dynamically _after_ the page is loaded. This challenge has been partially fixed by the adoption of SSR (Server Side Rendering), but that brings its own set of challenges like re-hydration and increased performance costs.
- **Poor HTTP-streaming support**: HTTP servers can return HTML content in _chunks_, which browsers can start immediately rendering. Few JavaScript frameworks take advantage of this performance improvement.
- **Bundle-size cost**: JavaScript-framework-based applications need to request JavaScript bundles to work at all (even with SSR enabled), which leads to increased render times. Network-latency is the worst performance-killer of JS-based web apps.

## The cost of client-side rendering

JavaScript frameworks operate on the principle of keeping track of the state (and its changes) of client-rendered components. Eeach has it's own way to deal with this -for instance, React brought the concept of maintaining a Virtual DOM-, but they all have to deal with the same challenge.

This book-keeping is not free: It requires memory and time. It is also additional to the book-keeping that the browser itself needs to perform for the native DOM elements. And you can't opt-out of it either -at least not easily-, as this state management is also performed for parts of the application that will never change.

## The cost of server-side rendering

Server-Side Rendering solved a lot of problems that Single-Page Applications (SPAs) suffered from their inception: Search-Engine Optimization (SEO) support, TTFB performance, and so on.

The hidden cost of these improvements came with complexity: Web applications now need to be rendered twice, once in the server, and another time in the browser. Even if a full re-render can be prevented in the browser, JS framworks need to account for differences between server and client functionality. Even when they have been optimized as the years have gone by, all this work has a cost on memory requirements and performance.

## The push towards server components

In recent months, we have seen an increasing interest in moving the rendering of components to be performed only on the server. [React server components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) is the most clear example of this.

While in many ways that is a step in the right direction, many have criticised this trend as a step backwards towards "old" technologies like PHP. What most crtics miss is that the majory of web developers nowdays have grown accostumed to a set of patterns and affordances that no traditional server-oriented web framwork provides.

In a way, there is no going back to the old ways as they were 10 years ago.

## A lightweight approach

What if, instead of assuming that the whole application is dynamic, we go in the opposite direction? Assume that all content is static, unless explicitely defined otherwise.

HTML elements by themselves -taking JavaScript out of the equation- are designed as static content: Only a subset of elements are explicitely dynamic.

This assumption free us from having to do a lot of unnecessary book-keeping. It also allows us to deliver page contents as mostly static HTML, with only specific instances of dynamic behavior.

This is the basis of LeanJSX: Code your web UI with the same tools that you would build your React application (JSX and JavaScript/TypeScript), but assuming that most of the components will be static, only opting into the dynamic behavior when you need it. And all of the rendering is performed by default on the server, with all the benefits for privacy and performance that this implies.

For more details on how static and dynamic behavior work on LeanJSX, visit the "Architecture section."