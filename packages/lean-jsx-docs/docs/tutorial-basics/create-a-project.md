---
sidebar_position: 1
---

# Setting up LeanJSX

## Create a new project

The easiest way to use LeanJSX is to create a new project using our project generator:

```
npx create-lean-jsx-app@latest <dir>
```

This will take you to a short step-by-step wizard to create a new project. The generator will execute `npm install` automatically.

## Start the server

To start the server, navigate to the directory created by the project generator (the directory name used in `<dir>`) and execute:

```
npm run dev
```

## Bundling the server

To transpile JSX code and bundle the server into a single script, run:

```
npm run build
```

The bundled application will be build in `dist`, along all static resources it needs.

## Adding LeanJSX to an existing project

LeanJSX relies on multiple tools to abstract the complexity of JSX rendering away from developers. Due LeanJSX currently being an Alpha release, a lot of the configuration and implementation details are subject to change. Because of this, setting up LeanJSX in an existing project without the project generator can be complex and error-prone.

While it is possible to use LeanJSX in an existing project, currently, our recommendation is not to try to configure LeanJSX in an existing server, and instead create a new project using the generator and extend it or connect it with other existing services. We hope this changes in a near future and future releases.

Having said that, developers are welcomed to contribute to the documentation to outline the steps needed to configure LeanJSX in an existing application.