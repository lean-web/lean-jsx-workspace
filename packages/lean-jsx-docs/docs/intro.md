---
sidebar_position: 1
---

# Intro

LeanJSX is a server-driven library that allows you to build HTML components using JSX-like syntax, but without relying on hefty client-side JavaScript libraries or frameworks.

## Features

- **Server-Driven**: 99% of rendering is performed on the server, minimizing the JavaScript payload, and deduping rendering execution.
- **Component-based development**: LeanJSX relies on JSX and TypeScript to build atomic UI components that are rendered once in the server and returned as pure HTML.
- **HTTP-streaming as first-class responses**: LeanJSX outputs HTML in chunks for quicker time-to-first-byte and faster rendering.
- **Asynchronous Components**: Supports async component functions, rendering placeholders while slow-rendering content is loading.
- **Event Handling**: Converts JSX-like event attributes to JavaScript snippets for client-side interactivity.

## Scope

LeanJSX is **not** a direct replacement for frameworks like React or Angular.

LeanJSX is a tool for web developers and web application projects who:

- Need a flexible way to build server-driven web applications using principles from modern JavaScript frameworks.
- Choose NodeJS/JavaScript to build web applications.
- Want to take advantage of their experience working with JSX in React while implementing server-rendered web apps.

## Why LeanJSX?

Not all web-based projects require powerful frameworks like React or Vue. In fact, a large number of existing web applications could operate as traditional, server-rendered MPAs (multi-page applications) with JavaScript-driven behavior sprinked here and there.

Client-side frameworks like React, Angular, and Vue have set a high bar for developer experience. They offer component-based architecture, tight type-checking integrations, and an ergonomic developer experience that makes building complex, dynamic UIs a breeze.

However, not every application needs the dynamic capabilities that these client-side frameworks offer. Many web applications serve content that is largely static, requiring dynamic behavior only in isolated portions of the UI. Despite this, developers often default to using heavyweight client-side libraries even for such use-cases, mainly because the alternative—traditional server-side frameworks—don't offer the modern development conveniences we've grown accustomed to.

### The Gap in Server-Side Frameworks

Traditional server-side frameworks have lagged in adopting the advancements that have become standard in the client-side ecosystem. They often:

- Lack a component-based architecture, making UI code harder to manage and reuse.
- Offer minimal, if any, type-checking between templates and rendering logic, leading to potential runtime errors that could be caught at compile-time.
- Fail to provide the ergonomic developer experience that's become the norm in client-side frameworks.

For a more detail explanation of the need of better Server-Side oriented web frameworks, take a look at [our FAQ section](/docs/faq/why-not-so-frameworks).

LeanJSX is a project that aims to bring the same development ergonomics as JavaScript frameworks like React provide, while also prioritizing **performance** through first-class HTTP-streaming and asynchronous rendering.

With LeanJSX, you get a component-based architecture, integrated type-checking, and an ergonomic development environment —all without the need for a heavy client-side framework-. This makes lean-jsx the ideal choice for web applications that don't require extensive client-side dynamics but still benefit from modern development practices.

### Why JSX?

While JSX's phylosophy may be controversial, one thing is true: Most web developers nowdays are familiar and proficient with React and JSX.

Instead of asking developers to learn a new templating paradigm, LeanJSX allows them to re-use their existing skills.

The most popular implementation of JSX is React, but JSX itself can be implemented without needed any kind of client-side processing.

Taking inspiration of React Server Components, LeanJSX takes that approach to the realm of server-oriented web framworks.
