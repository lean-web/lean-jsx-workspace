export type TextNode = string;
export interface StaticNode extends Omit<SXL.StaticElement, "type"> {
  type: string;
}

export interface FunctionNode extends Omit<SXL.StaticElement, "type"> {
  type: SXL.NodeFactory;
}
export interface ClassNode extends Omit<SXL.StaticElement, "type"> {
  type: SXL.ClassFactory;
}

export function isClass(
  func: string | SXL.NodeFactory | SXL.ClassFactory
): func is SXL.ClassFactory {
  return (
    typeof func === "function" &&
    /^class\s/.test(Function.prototype.toString.call(func))
  );
}

export function isTextNode(jsx: SXL.StaticElement | string): jsx is TextNode {
  return typeof jsx === "string";
}

export function isFunctionNode(
  jsx: SXL.StaticElement | SXL.Children
): jsx is FunctionNode {
  if (typeof jsx === "string" || Array.isArray(jsx)) {
    return false;
  }
  return typeof jsx.type === "function" && !isClass(jsx.type);
}

export function isPromise(
  jsx: SXL.StaticElement | Promise<SXL.StaticElement> | undefined | string
): jsx is Promise<SXL.StaticElement> {
  return typeof jsx !== "string" && !!jsx && "then" in jsx;
}

export function isClassNode(
  jsx: SXL.StaticElement | SXL.Children
): jsx is ClassNode {
  if (typeof jsx === "string" || Array.isArray(jsx)) {
    return false;
  }
  return typeof jsx.type === "function" && isClass(jsx.type);
}

export function isArrayOfNodes(
  jsx: SXL.StaticElement | SXL.Children
): jsx is Array<SXL.StaticElement | string> {
  return Array.isArray(jsx);
}

export function isStaticNode(
  jsx: SXL.StaticElement | string
): jsx is StaticNode {
  return (
    !isTextNode(jsx) &&
    !isArrayOfNodes(jsx) &&
    !isFunctionNode(jsx) &&
    !isClassNode(jsx)
  );
}

export function isFragmentNode(
  jsx: SXL.StaticElement | undefined
): jsx is FunctionNode {
  return !!jsx && /jsxFragment/i.test(jsx.type.toString());
}
