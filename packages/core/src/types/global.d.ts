/* eslint-disable @typescript-eslint/no-namespace */
/// <reference lib="dom" />

import { SXLGlobalContext } from "./context";

/**
 * A utility type for making {@link HTMLElement} properties optional.
 */
export type HTMLAttributes<T extends HTMLElement> = Partial<
    Omit<T, "style">
> & {
    style?: Partial<T["style"]>;
};

/**
 * Global namespace
 */
declare global {
    /**
     * The namespaces for all JSX components.
     *
     * By default, TypeScript will asume that these types are provided by React.
     *
     * However, we are providing our own implementation here, so we need to expose these
     * types to the global interface for all common tooling (like IDEs) to work as they would
     * with a React project.
     */
    export namespace SXL {
        /**
         * Represents a set of data create for each JSX component.
         */
        export type Context<Ctx extends Record<string, unknown>> = Ctx;

        /**
         * The children elements of a JSX component.
         */
        export type Children = Array<string | StaticElement>;

        /**
         * The base properties that a JSX component can receive.
         */
        export interface Props
            extends Omit<HTMLAttributes<HTMLElement>, "children"> {
            children?: Children;
            dataset?: DOMStringMap;
            globalContext?: SXLGlobalContext;
        }

        /**
         * An override of {@link SXL.Props} that allows us to set a custom type for {@link SXLGlobalContext}.
         * This is mostly used during testing.
         */
        export interface ComponentProps<G extends SXLGlobalContext>
            extends Omit<Props, "globalContext"> {
            globalContext?: G;
        }

        /**
         * A function that returns a JSX node (usually "jsxDEV" or "jsx")
         */
        export type NodeFactory = (args: Props) => StaticElement | AsyncElement;

        /**
         * The types for a Class Component.
         */
        export interface ClassComponent {
            /**
             * Render a temporary placeholder that will be replaced by the
             * return value of "renderLazy"
             */
            render(): StaticElement;
            /**
             * Render a JSX component.
             */
            renderLazy(): StaticElement | AsyncElement;
        }

        /**
         * A reference to the {@link ClassComponent} constructor.
         */
        export interface ClassFactory {
            new (props: Props | undefined): ClassComponent;
        }

        /**
         * A narrowed-down type of {@link SXL.StaticElement}.
         * Used for class components.
         */
        export type ClassElement = {
            type: ClassFactory;
            props: Props;
            children: Children;
            isDynamic?: boolean;
            ctx?: Context<Record<string, unknown>>;
        };

        /**
         * A narrowed-down type of {@link SXL.StaticElement}.
         * Used for function components.
         */
        export type FunctionElement = {
            type: NodeFactory;
            props: Props;
            children: Children;
            isDynamic?: boolean;
            ctx?: Context<Record<string, unknown>>;
        };

        /**
         * The properties of a JSX component.
         */
        export type StaticElement = {
            type: string | NodeFactory | ClassFactory;
            props: Props;
            children: Children;
            isDynamic?: boolean;
            ctx?: Context<Record<string, unknown>>;
        };

        /**
         * An async component.
         */
        export type AsyncElement = Promise<StaticElement>;

        /**
         * Base type for a JSX element.
         * A JSX component can returned by a regular, syncronous function as {@link SXL.StaticElement}
         * of by an async function (an async component) as {@link SXL.AsyncElement}
         */
        export type Element = StaticElement | AsyncElement;
    }

    namespace JSX {
        type Element = SXL.Element;
        interface ElementClass extends SXL.ClassComponent {}
        interface IntrinsicElements {
            a: HTMLAttributes<HTMLAnchorElement>;
            aside: HTMLAttributes<HTMLDivElement>;
            body: HTMLAttributes<HTMLBodyElement>;
            h1: HTMLAttributes<HTMLHeadingElement>;
            h2: HTMLAttributes<HTMLHeadingElement>;
            h3: HTMLAttributes<HTMLHeadingElement>;
            h4: HTMLAttributes<HTMLHeadingElement>;
            p: HTMLAttributes<HTMLParagraphElement>;
            button: HTMLAttributes<HTMLButtonElement>;
            div: HTMLAttributes<HTMLDivElement>;
            ul: HTMLAttributes<HTMLUListElement>;
            li: HTMLAttributes<HTMLLIElement>;
            img: HTMLAttributes<HTMLImageElement>;
            nav: HTMLAttributes<HTMLElement>;
            span: HTMLAttributes<HTMLSpanElement>;
            form: HTMLAttributes<HTMLFormElement>;
            input: HTMLAttributes<HTMLInputElement>;
            template: HTMLAttributes<HTMLTemplateElement>;
            main: HTMLAttributes<HTMLElement>;
            hr: HTMLAttributes<HTMLHRElement>;
        }
    }
}

export {};
