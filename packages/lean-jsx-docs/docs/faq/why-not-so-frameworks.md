---
sidebar_position: 2
---

# Why not just a SO (server-oriented) web framework?

Unfortunately, existing SO (server-oriented) web frameworks focus too little in the actual web development experience that JavaScript frameworks have cultivated for years:

- **Component-based web development**: Most templating engines in SO web frameworks lack the support of component-based development, often deferring that to JavaScript frameworks.
- **Static templating management**: Templates in SO web frameworks are treated as either strings or data structures with placeholders that are filled by code.
- **Poor first-class HTML validation**: The hard boundary between templates and data logic makes it difficult to type-check the integration of both.
- **HTTP-streaming is mostly optional**: By default, SO web frameworks construct the whole response before returning it, which has given them the bad reputation of being slow for first-content load.

