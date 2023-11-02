---
slug: the-case-for-leanjsx-p2
title: The case for LeanJSX (part 2)
authors: pfernandom
tags: [leanjsx, release, alpha]
---

After a walk down memory lane in web development, let us jump into the question: Why did I wrote LeanJSX?

> TLDR; LeanJSX is an alternative for all those web-based projects when _"you don't need a framework"_ but you still want to build server-driven web applications in a modular, component-based approach that React has made popular for the past decade, without having to use React.
>
> It's like writing React applications, but using vanilla JavaScript and plain HTML under the hood.

## If not a framework, then what?

In the previous blog post I mentioned I agree with the idea that not all web applications need a full-fledged JavaScript framework:

> _"There is a high change that your application don't need a framework"_

One day after catching myself saying these words, I also asked myself:

> _"Then, what do I **need**?"_

It's an oversimplification of the actual question in my head. A better wording would be: _"If most applications **don't** need a JavaScript framework, what options do they have?"_.

The only answer I've heard for questions like that is just _"vanilla JavaScript and HTML"_.

So I tried it, and I really disliked it. I mean, I could see the _didactic_ benefit of manually writing a web application using only HTML and JavaScript, but I could also see how hard to maintain that was.

## Going vanilla

Let's look at a simple example of vanilla JavaScript. You have a simple HTML button:

```html
<button>Click me</button>
```

Now, a button that does nothing when you click it is useless. Let's keep throwing vanilla at it.

First, we need to get a reference to this element in JavaScript and add an event listener:

```js
const button = document.querySelector('button');
button.addEventListener('click', (ev) => {
    console.log('Click!')
})
```

Not too bad, but also not good:

- There can be more than one button, so we need to add a ID or any other unique attribute to the button.
- This has to be careful wrapped in *another* event listener for `DOMContentLoaded` or `load`. Otherwise, the button _may not be there_ at all!.

```html
<button id="btn1">Click me</button>
```

```js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#btn1');
    button.addEventListener('click', (ev) => {
        console.log('Click!')
    })
})
```

Again, not to bad, but I wouldn't call this "awesome". From a development ergonomics point of view:

- You have to keep two separate context in mind at the same time.
- This is the minimal code needed for one single event handler. No way around the "get element reference, then add event listener" two-step process.

Now, compare that with JSX:

```jsx
<button onclick={() => {console.log('Click')}}>Click me</button>
```

Obviously _is not that simple_: This needs to be transpiled into actual JavaScript, loaded and rendered. And if we need to support SEO, it has to be SSR'ed. But leave those things aside for a second, and focus on the JSX itself:

- No need to switch context (and files) between HTML and JavaScript. It's all in the same place.
- Not manually having to get a reference to the DOM element.
- No need to guarantee that the DOM is loaded. Whoever implemented the underlying JSX rendering took care of that.

I won't argue that this is the best solution to this ergonomics problem, but it is _a_ solution, and one that thousands of developers are already familiar with, for that matter.

### More vanilla challenges: Sharing data between JavaScript and HTML

I think one of the things that I disliked the most of pure vanilla JavaScript is around development ergonomics: There is just so much manual wiring needed to just make a button "clickable", wiring that is hard or just time consuming to abstract a way in a maintenable way.

The previous example could have been addressed by just bringing the old, reliable tools: Go JQuery on that button! 

But, what if we want to write a button to greet our users?

```html
<button id="btn1">Say hi to John</button>
```

```js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#btn1');
    button.addEventListener('click', (ev) => {
        console.log('Hi John!')
    })
})
```

It's all good if `"John"` can be hardcoded. But, what if that comes from a database?

Now the whole thing gets more complicated:

```html
<button id="btn1">Loading...</button>
```

```js
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#btn1');

   fetchUser().then(user => {
    button.textContent = `Say hi to ${user.firstName}`
        button.addEventListener('click', (ev) => {
            console.log(`Hi ${user.firstName}`)
        })
   })
})
```

Users will only be able to click on this button _after_ the whole page loads and the user information is fetched. Before that, you only have a useless button.  JQuery itself cannot save us from this.

Of course, this is only one approach. You could also:

- Return the data on page load as an embedded stringified JSON and retrieve it using JavaScript, _then_ updating the button contents and the event listener.
  - We save ourselves a round-trip to the server, at the cost of having to manually store state somewhere in the page, being careful of avoiding naming collitions because this is now global state.
- Render _both_ HTML and JavaScript code on the server.
  - That could save us from having to show a "Loading..." message and have to update the button contents with JavaScript, but we get a new set of challenges:
    - The contents of the JavaScript file need to be dynamically rendered on the server. Writing tests for this would be a nightmare.

None of this solutions are impossible. In fact, we've been doing this for decades in traditional server-driven web frameworks.

But let's just look again to JSX:

```jsx
async function GreeBtn() {
    const user = await fetchUser();
    return <button onclick={() => {
            console.log(`Hi! ${user.firstName}`)
        }}>
        Say hi to {user.firstName}
    </button>
}
```

Again, leaving implementation work aside, the development experience is very straightforward:

- All code related to this piece of content is collocated.
- All rendering-related behavior is encapsulated in a single place, instead of being spread in multiple files
  - Granted, most of the time the code for the event handler wouldn't be fully inlined, but in JSX you can just define a function right above the JSX definition.

But we cannot ignore the implementation work anymore, nor the concerns many developers have regarding React Server Components (to which this last JSX example is extremely similar):

- React client components cannot be _async_.
- React server components are still working on defining better boundaries between which components run in the server versus which run on the client, to avoid confusions or leaking sensitive information from the server into the client.
- At the end, this is pure JavaScript, which needs to be SSR'd, loaded from a bundle on the client and re-hydrated, all before the button can be useful.

It would be awesome if we could just write this piece of JSX, have it rendered once directly as HTML and get all JavaScript just for the event handling wiring for free. Here is where a make my case for LeanJSX.

## LeanJSX in the middle land

In LeanJSX, the last example of JSX we just saw is a valid component. Also the following example is valid:

```jsx
async function* GreeBtn() {
    // render something while we wait:
    yield (<>Loading</>)

    const user = await fetchUser();
    return <button onclick={() => {
            console.log(`Hi! ${user.firstName}`)
        }}>
        Say hi to {user.firstName}
    </button>
}
```

LeanJSX will take this compoenent and translate it into pure HTML and a bit of vanilla JavaScript, which then -with the power of [chunked transfer encoding](https://en.wikipedia.org/wiki/Chunked_transfer_encoding) will be streamed and rendered in the browser piece-by-piece:

```html
<div data-placeholder="element-0">Loading</div>

<template id="element-0">
    <<button data-action="element-1">Say hi to John</button>
    <script>
        (function(){
        document.querySelector('[data-action="element-1"]').addEventListener('click', () => alert(`Hi! John`))
        }).call({})
    </script>
</template>
<script>
    sxl.fillPlaceHolder("element-0");  
</script>
```

Looks a bit convulated, but in practice this is what happens:

- A placeholder element containing `Loading` will be rendered in the browser.
- Once the user information is fully fetched, a `<template>` element is sent to the browser, along with inlined JavaScript code which will:
  - Replace the loading placeholder with the actual button contents.
  - Create the event handler for the `onclick` event, passing the correct handler to it.

I know, you may have taken a step back in horror after seeing those inlined `<script>` tags. But there is a good reasong behind that: The button will be rendered and interactive _before_ the page or any other JavaScript bundle finishes loading. No need to wait for a `DOMContentLoaded` event.

Wait, but `sxl.fillPlaceHolder` needs to come from somewhere, right?

That is correct. LeanJSX _does_ include one single JavaScript file at the top of the document. You can see the pre-minified contents of that file [here](https://github.com/lean-web/lean-jsx/blob/main/src/web/wiring.ts).

It's a minimal-sized file which, adding GZIP and cache in top of it, has an almost neglectible impact on the page. the size for this script also remaing constant regardless of the number of components in your application.

As long as you're careful of not passing tons of code to your event handlers, that blocking, inline JavaScript code will be pure goodness.

### Finally: The use case for LeanJSX

LeanJSX is not a framework. It's basically a rendering engine for the server that uses JSX and defines a set of conventions on how to build web UIs; these conventions are based in how we currently build React applications.

**I built LeanJSX for all those cases when _"you don't need a framework"_ but you still want to build server-driven web applications in a modular, component-based approach.**

It's like writing React applications, but using vanilla JavaScript and plain HTML under the hood.

For a better insight on the use cases and limitations of LeanJSX, take a look at [our docs](/docs/architecture/use-cases).

There you can also find an in-dept explanation of how LeanJSX works under the hood, and how it handles some of the challenges of building modern web applications.