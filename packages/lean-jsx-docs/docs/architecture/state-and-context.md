---
sidebar_position: 5
---

# Event handlers, state, and context management

LeanJSX approach to content rendering requires developers to manage application state in a different way than regular JavaScript frameworks.

Currently, LeanJSX-based components have no concept of **hooks** nor state updates (there is no state!), and components cannot be re-rendered on the browser (in the traditional, React-style). From the browser's point of view, there are no components -only those defined by developers using LeanJSX-, only HTML.

> Work in progress. Future releases of LeanJSX will include default methods for updating components after page load. Meanwhile, developers can implement their own conten-update functionality.

Additionally, since LeanJSX components are fully server rendered, component state is completely defined and maintained on the server.

## Local context

LeanJSX components can define their own data for rendering:

```jsx
funcion MyComponent() {
    const user = {firstName:"John", lastName:"Doe"}
    return <p>Welcome {user.firstName} {user.lastName}</p>
}
```

State can also be retrieved resources like databases and service APIs:

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

State can also be passed to components as properties -like in regular React components-:

```tsx
interface MyProps extends SXL.Props {
    title:string;
}

export function Layout({ title, children }: MyProps) {
   return <>
        <h1>{title}</h1>
        <div>{children}</div>
   </>
}
```

### Local state boundaries

Component state is, by default, kept only on the server. The `user` object in the example above is never sent to the browser, only the rendered content is returned.

This approach has the benefit of setting **data privacy by default**: You can request sensitive data without risking leaking it to users:

```jsx
async funcion MyComponent() {
    const userSecrets = await fetchUserSecrets()
    const userData = await fetchUserData(userSecrets)
    return <p>Welcome {userData.firstName} {userData.lastName}</p>
}
```

In this example, only `userData.firstName` and `userData.lastName` are sent to the browser, while `userSecrets` and the rest of `useData` remain safely stored on the server.

The only time LeanJSX returns non-HTML data to the client is when using **event handlers**.

#### Event handlers and context

LeanJSX components support adding event handlers directly to HTML content:

```jsx
funcion MyComponent() {
    return <button onclick={() => alert(`Hello John`)}>
            Click to greet user
        </button>
}
```

First, notice that `onclick` follows the same syntax as native HTML elements (not `onClick` like React). This is true for any [event attribute](https://www.w3schools.com/tags/ref_eventattributes.asp) property in any HTML element.

Second, event handlers are client-rendered by default. There is no way to make these work without sending the contents of the handler attribute back to the client.

Second, event handlers have access to the function's local scope, which means that they need access to this data *in the browser*.

For the component above, LeanJSX will stream the following HTML content:

```html
<button data-action="element-0">Click to greet user</button>
<script>
    (function(){
    document.querySelector('[data-action="element-0"]').addEventListener('click', () => alert(`Hello John`))
    }).call({"props":{"dataset":{},"globalContext":{}}})
</script>
```

- If an event handler is defined in a component(e.g. `onclick`), LeanJSX will automatically attach an event listener for the element in an inline script element which will be rendered immediately after the component is rendered.
- Properties passed to the component are marshaled into a JSON string, and passed as `this` to the IIFE created by LeanJSX.
- The `globalContext` (more details on this next) is also added to the handler scope.

Now, when a user clicks on the button -even before the rest of the page finishes loading-, the event handler will execute correctly.

What if the event handler needs access to data defined *inside* the function? In this case, we can add attributes to the *scope* of the function itself: `this`:

```tsx
type UserContext = { user: { firstName: string } };

function Home(this: UserContext) {
    this.user = { firstName: "John" };
    return (
        <button onclick={() => alert(this.user.firstName)}>
            Click to greet user
        </button>
    );
}
```

This component will be rendered as follows:

```html
<button data-action="element-0">Click to greet user</button>
<script>
    (function(){
    document.querySelector('[data-action="element-0"]').addEventListener('click', () => alert(this.user.firstName))
    }).call({
        "props":{"dataset":{},"globalContext":{}},
        "user":{"firstName":"John"}
    })
</script>
```

By allowing developers to set content into the component's function `this` scope, we allow them to choose what data they want to expose to the client, preserving sensitive data on the server's scope.

> Notice that the props are by default passed to the client. Any sensitive data passed as a prop will also be exposed. Developers must be careful with the data that is passed as a prop. In future releases, we will provde a way to indicate which props should be exposed to the browser.

## Global context

In the React world exists the concept of [context](https://react.dev/learn/passing-data-deeply-with-context).

Context allows developers to define state that isn't fully owned by a single component, and instead is meant to be accessed by multiple parts of the application.

The analog feature in LeanJSX for context is `GlobalContext`. The global context is a single object that lives for the duration of a single request in the server. Internally, LeanJSX passes a reference to `globalContext` to all components, allowing them to access this shared state.

When using TypeScript, a global state is defined like follows:

```ts
export interface RequestQueryParams {
    someOption?: string;
}

declare module "lean-jsx/src/types/context" {
    interface SXLGlobalContext extends RequestQueryParams {}
}
```

The default pattern to define the contents of the global state is to pass query parameters to it:

```jsx
export function parseQueryParams(req: Request): RequestQueryParams {
    return {
        someOption: req.query?.someOption
    };
}

app.use("/", async (req, res) => {
    const globalContext = parseQueryParams(req);

    await LeanApp.renderWithTemplate(
        res,
        <Home />,
        globalContext,
        //...options
    );
});
```

Now, the value for the query parameter `someOption` will be available for any component:

```jsx
function Home(props: SXL.Props) {
    const { someOption } = props.globalContext?.someOption;
    // use the context...
    return (
       <>...</>
    );
}

// No need to pass the global context:
<Home/>
```

### Semi-dynamic page state

An advantage of setting the values of global context using query or path parameters is that we can conditionally render different content for the same page.

For simple applications that require conditional content rendering, query-param-driven context is a way to offer semi-dynamic behavior without having to keep track of session state on the server. These kind of web applications are called **stateless apps**, and they are extremely useful in the context of [micro-services architectures](https://www.redhat.com/en/topics/cloud-native-apps/stateful-vs-stateless).

When a web application is stateless, it's very easy to create distributed applications: Web applications can be deployed in multiple instances behind a **load balancer**, and user traffic can be distributed evenly among them without having to keep [sticky sessions](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html).
