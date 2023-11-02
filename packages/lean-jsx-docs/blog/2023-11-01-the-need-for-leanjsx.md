---
slug: the-case-for-leanjsx-p1
title: The case for LeanJSX (part 1)
authors: pfernandom
tags: [leanjsx, release, alpha]
---

Now that the first Alpha relase for LeanJSX is out, I wanted to share with y'all some background about the project.

For this, I have written two blog posts:

- A quick look back into the state of web development
- Where LeanJSX fits in that history

> TLDR; Server-rendered web applications were not great in the past, which is why we ended up having JavaScript frameworks like Angular and React.
> This is may not the case anymore (at least not for *all* projects), which is why it's a great time for something like LeanJSX.

## The case for (and against) web frameworks

More than once I've heard the words that many senior web developers like to repeat at the height of [JavaScript fatigue](https://auth0.com/blog/how-to-manage-javascript-fatigue/):

> _"There is a high change that your application don't need a framework"_

I fully agree with that thought. After years working with different JavaScript frameworks, from their humble beginnings with JQuery all the way to the latest React/Server Components trend, I can see how we have gradually pushed ourselves into the realms of over-engineering.

And don't get me wrong, I love working with JavaScript frameworks and all the latest tooling that come with them. I really enjoy working with things like TypeScript and bundlers -things that now come as part of these tools by default-, and being able to build full web applications without having to start an API server.

However, I also recognize that, as powerful as they are, these tools don't come for free. Adopting them has a cost in development effort, maintenance and above all, performance. Many applications have requirements for which these are valid trade-offs, but being honest, most of the time this is not the case.

## To SPAs and back

It's been more than 13 years ago that AngularJS started making the rounds in web development. Back then, building complex web applications -things beyond simple blogs and personal websites- was a task that was tightly coupled with the backend and strongly divided in two parts:

- Write templates in the server-side (PHP, JSPs, etc).
- Write JavaScript independently for UI widgets and content (JQuery, ExtJS, Mootools, etc).

You could write each independently, but you couldn't test and execute each in isolation. I spent months maintaining a static copy of the web application just so I could work on the JavaScript side faster.

AngularJS didn't do much to change that, but introduced patterns that were relatively new for web development: Dependency injection, mocking, unit testing, etc; things that you needed to implement yourself before if you wanted them in your web code -which seldom happened-. For many people, including me, that started a revolution on how to build web applications.

Fast forward to 2023, and now you have web developers who not only have never had to build a backend-only server, but who have never worked with pure HTML/JS/CSS. I don't mention this as a critic, but only to outline how far we've gotten with web-development tooling alone.

But now, things like React Server Components and SSR -in an effort to fix SEO problems and improve performance- are moving us back to those old days of server-rendered web content.

Having gone almost full-circle, it is a good moment to stop and see were we're standing.

## The "reinvention" of server-rendered content

SPAs were created in an effort to create performant web applications. Server-rendered, multi-page applications (MPAs) were looked down as being bad for performance, and most of the time they were; not because they were inherently bad but due many reasons:

- The increasing need for better looking, more dynamic web applications.
- Browsers and servers were ill prepared for dynamic applications. Moving logic to JavaScript was basically a hack to work around the lack of support of traditional web development tooling for increasingly complex web applications.
- The lack of maturity of supporting infrastructure. Databases and other services were not as optimied for web traffic as they are today.

I try to mention this things without over-generalizing, as obviously this wasn't the case for _all_ tools, servers and applications. But we cannot deny that JavaScript-driven applications came to fill a whole MPA shaped.

These things are not true anymore. In fact, the most common performance challenges in web applications come around network latency -a challenge made even more common due the extended usage of mobile devices-, and increasing bundle sizes.

The major reason driving the re-adoption of server-rendered component is exactly network latency:

- Requests for data fetching done on the server tend to be faster than those performed on the users devices.
- Server-rendered content in many cases can mean reduced JavaScript bundles.

A big telling that server-rendered content is not a huge bottleneck anymore is that we're starting to use it again to _improve performance_.

It is now a great moment to revisit our pre-conceptions about server-side web development and MPAs, which is in part what we will do in the next post.
