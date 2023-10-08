import { ContextFactory } from "@/jsx/html/context";
import { AsyncManager } from "@/jsx/html/stream/async-manager";
import { describe, expect, test } from "@jest/globals";
import { withSxlStaticElement } from "./test-utils";
// import jsdom from 'jsdom'

describe("async manager", () => {
  test("Handle async element", () => {
    const manager = new AsyncManager(new ContextFactory());
    const asyncElement = Promise.resolve(withSxlStaticElement());
    const loading = withSxlStaticElement({
      type: "div",
      withTextChild: "Loading",
    });

    const placeholder = manager.handle(asyncElement);

    expect(placeholder).toStrictEqual(
      withSxlStaticElement({
        type: "div",
        withDataSet: {
          "data-placeholder": "placeholder-element-0",
        },
      })
    );
    expect(manager.asyncQueue.length).toBe(1);
  });

  test("Handle async element with loading state", () => {
    const manager = new AsyncManager(new ContextFactory());
    const asyncElement = Promise.resolve(withSxlStaticElement());
    const loading = withSxlStaticElement({
      type: "div",
      withTextChild: "Loading",
    });

    const placeholder = manager.handle(asyncElement, loading);

    expect(placeholder).toStrictEqual(
      withSxlStaticElement({
        type: "div",
        withTextChild: "Loading",
        withDataSet: {
          "data-placeholder": "placeholder-element-0",
        },
      })
    );
    expect(manager.asyncQueue.length).toBe(1);
  });
});
