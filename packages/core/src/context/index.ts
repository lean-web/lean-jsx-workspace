interface ComponentContext {
    getId(): string;

    toSource(): string;

    decorate(vnode: SXL.Element): SXL.Element;
}
export type Context<Ctx extends Record<string, unknown>> = Ctx &
    ComponentContext;

export interface SXLGlobalContext {}
