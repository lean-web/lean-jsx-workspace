/* eslint-disable @typescript-eslint/no-namespace */
/// <reference lib="dom" />

import { SXLGlobalContext } from "./context";

export type HTMLAttributes<T extends HTMLElement> = Partial<
    Omit<T, "style">
> & {
    style?: Partial<T["style"]>;
};

declare global {
    export namespace SXL {
        export interface ComponentContext<Ctx> {
            getId(): string;

            toSource(): string;

            decorate(vnode: Element): Element;
        }
        export type Context<Ctx extends Record<string, unknown>> = Ctx;

        export type Children = Array<string | StaticElement>;

        export interface Props
            extends Omit<HTMLAttributes<HTMLElement>, "children"> {
            children?: Children;
            dataset?: DOMStringMap;
            globalContext?: SXLGlobalContext;
        }

        export interface ComponentProps<G extends SXLGlobalContext>
            extends Omit<HTMLAttributes<HTMLElement>, "children"> {
            children?: Children;
            dataset?: DOMStringMap;
            globalContext?: G;
        }

        export type NodeFactory = (args: Props) => StaticElement | AsyncElement;

        export interface ClassComponent {
            render(): StaticElement;
            renderLazy(): StaticElement | AsyncElement;
        }

        export interface ClassFactory {
            new (props: Props | undefined): ClassComponent;
        }

        export type ClassElement = {
            type: ClassFactory;
            props: Props;
            children: Children;
            isDynamic?: boolean;
            ctx?: Context<Record<string, unknown>>;
        };

        export type FunctionElement = {
            type: NodeFactory;
            props: Props;
            children: Children;
            isDynamic?: boolean;
            ctx?: Context<Record<string, unknown>>;
        };

        export type StaticElement = {
            type: string | NodeFactory | ClassFactory;
            props: Props;
            children: Children;
            isDynamic?: boolean;
            ctx?: Context<Record<string, unknown>>;
        };

        export type AsyncElement = Promise<StaticElement>;

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
