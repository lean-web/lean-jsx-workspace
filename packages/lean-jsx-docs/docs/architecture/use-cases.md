---
sidebar_position: 6
---

# Use cases and limitations

LeanJSX's approach to handling [both static and dynamic content](/docs/architecture/static-vs-dynamic) sets some hard constraints on how developers build their applications, and defines the type of web applications for which LeanJSX is a good tool.

The main use case for LeanJSX is building **semi-dynamic web applications**: Applications where most of the conten is static, and only one or two components are dynamic can avoid the overhead of full JavaScript frameworks, while still keeping the benefits of component-based UI development and asynchronous rendering.

Other use cases are:

- **Server-driven, performance-critical web applications**. LeanJSX focuses providing fast content responses with low overhead from JavaScript bundles. Applications that favor performance over dynamic behavior can greatly benefit from LeanJSX.
- **Web applications for low-end mobile devices and slow-networks**. Web applications that rely on server-rendered content, but are targeted to users with low-end mobile devices, or users who live in geographic areas with poor network coverage and speeds. PWAs ([Progressive Web Applications](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)) can easily be build on top of LeanJSX.

## Limitations and alternatives

### Fully dynamic web apps

The support for fully-dynamic applications is very limited in LeanJSX. This is intentional.

By opting out of supporting component state tracking and diffing in the browser, LeanJSX loses a lot of the features needed for fully-dynamic behavior, but it wins a boost in performance. This is a welcomed trade-off.

Another limitation for dynamic behavior is that most content updates in LeanJSX are based on fully replacing large areas of the page with pure HTML. Applications that heavily rely to retain user state on multiple places of the page while also needing to update their contents may find LeanJSX approach too limiting.

LeanJSX is not complete replacement for frameworks like React, Angular, Vue, Ember or Svelte. By itself, LeanJSX is not really a framework, but a server-driven templating engine with predefined conventions.

For web applications whose most of their contents are fully dynamic in nature, JavaScript frameworks are a better option.

## Fully static web apps

LeanJSX is an excellent tool to build completely static web applications: Applications whose contents are not changed during the lifetime of a single page load: Blogs, news sites, and so on.

However, a simpler option for this use cases is to just use static HTML/JS/CSS.

A static web application hosted on a CDN has many advantages over any server-rendered web application:

- Easier to maintain. No server-side code.
- Lower hosting costs (no need for servers that run NodeJS or similar stacks).
- Cacheable by default.

Having said that, LeanJSX support of HTTP chunking can offer some additional performance benefits over some CDNs that don't offer this feature out-of-the box.
