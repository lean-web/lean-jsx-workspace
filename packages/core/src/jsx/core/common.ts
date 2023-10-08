function formatChildren(children: SXL.Children) {
  if (!Array.isArray(children)) {
    return [children];
  }

  return children.filter((el) => el);
}

export function jsxElement(
  type: string | SXL.NodeFactory,
  props: SXL.Props
): SXL.StaticElement {
  const actions = Object.fromEntries(
    Object.entries(props).filter(([key]) => /^on/.test(key))
  );
  props.dataset = props.dataset ?? {};

  const { children, ...others } = { children: [], ...props };

  const node = {
    type,
    props: others,
    children: formatChildren(children),
    actions,
  };
  return node;
}

export function jsxFragment(props: SXL.Props): SXL.StaticElement {
  const { children } = { children: [], ...props };

  return {
    type: "fragment",
    props,
    children: formatChildren(children),
  };
}
