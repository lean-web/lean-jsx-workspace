---
sidebar_position: 6
---

# Dependencies

LeanJSX relies on the following tooling:

- **TypeScript**: LeanJSX projects are configured by default to use TypeScript (though use of pure JavaScript can still be configured).
  - The JSX implementation that LeanJSX provides relies on TypeScript for overriding the default React implementation.
- **esbuild**: To allow developers to use JSX directly on the server route handlers, LeanJSX uses esbuild to transpile and bundle the server into a single NodeJS script.
- **Vite**: LeanJSX relies on Vite's bundling of web applications to:
  - Process the skeleton HTML templates that are filled with JSX content. 
  - Bundle developer-defined resources like CSS and client-side JavaScript.
  - Inject LeanJSX-specific dependencies into the page.
- **Express**: Express is the most ubiquitous HTTP server in NodeJS, which is why it is the default choice for LeanJSX projects.
  - Support for other servers is planned for future releases
- **pino**: The default logging implementation for LeanJSX uses [Pino](https://github.com/pinojs/pino) under the hood.
- **eslint/typescript-eslint**: Eslint is configured out of the box, and includes a LeanJSX specific plugin.
- **Nodemon**: For live reloading on server changes when running `npm run dev`.

