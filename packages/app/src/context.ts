import type { Request } from "express";

export interface RequestQueryParams {
    withLoadingState?: boolean;
    dynamicProductList?: boolean;
    jsDisabled?: boolean;
}

declare module "lean-jsx-types/lib/context" {
    interface SXLGlobalContext extends RequestQueryParams {}
}

export function parseQueryParams(req: Request): RequestQueryParams {
    return {
        jsDisabled: Boolean(req.query?.jsDisabled),
        withLoadingState: Boolean(req.query?.withLoadingState),
        dynamicProductList: Boolean(req.query?.dynamicProductList),
    };
}
