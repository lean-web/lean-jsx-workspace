---
sidebar_position: 4
---

# Create a component

Components are classified in two: **static** and **dynamic**.

Components by default are **static**. This means that a component will not be re-rendered by default during a single page load.

> *Probably you're used to React's behavior where a component will be updated if their props change -probably as an effect of a parent component re-rendering or a result of a network request-.*
> *This doesn't happen in LeanJSX as components are rendered as pure HTML.*
> *For re-rendering content without reloading the whole page, take a look at the [dynamic components](/docs/tutorial-basics/create-a-dynamic-component) section.*

A static component can be built with one of the following options:

## Variables

The simples component can be create by assigning JSX to a variable:

```jsx
const Button = <button>Click</button>
```

These are useful for creating components that receive no parameters.


## Functions

The most common component type is **function-based**. Simply, define a function that returns JSX:

```jsx
function MyComponent() {
    const name = 'Pedro'
    return <p>Hello {name}!</p>
}
```

Function based components can receive custom props when rendered:

```jsx
function MyComponent({name}: {name:string}) {
    return <p>Hello {name}!</p>
}
// ...

<MyComponent name={'Pedro'}/>
```

## Async functions

Unlike normal React components -but similar to React Server Components- LeanJSX components can be `async` -they can return a `Promise<JSX.Element>`:

```jsx
async function MyComponent() {
    const name = await getName();
    return <p>Hello {name}!</p>
}
```

Async function components are simple and a good choice when needing to fetch content from a database or external services.

However, these components they lack a default way to provide content (a "loading" state) to render while the `await` statement completes, which may cause reflow for slow-loading async components.

If the resource you're fetching in the async function is relatively fast, a simple async function is enough. When the resource is slow, a better option is **async gen components**.

## Async gen components

Another way to create an async-based component is using an async generator function:

```jsx
async function* MyComponent() {
    yield (<>Loading...</>)
    const name = await getName();
    return <p>Hello {name}!</p>
}
```

> Note: Currently, async gen based components can only yield **once**. We have defined eslint rules to prevent developers from yielding more than once by mistake.

Async gen components allow developers to `yield` temporary content that will rendere as a placeholder for the component while any `await` statements are pending.

Like mentioned before, async-gen components are a good choice for components that fetch slow-loading data.

## Class components

Components can also be defined as JavaScript classes:

```jsx
class MyComponent {
      props: ClassProps;

      greet: string = "Hello";

      constructor(props: ClassProps) {
        this.props = props;
      }

      onLoading() {
        return <div>Loading...</div>;
      }

      async render() {
        await something();
        return (
          <div>
            {this.greet} {this.props.globalContext?.username}
          </div>
        );
      }
    }
```

Similarly to async-gen components, class components allow defining placeholder content by defining a `onLoading` method in them.
