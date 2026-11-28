import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import HomePageClient from "./HomePageClient";

interface ElementProps {
  children?: React.ReactNode;
  className?: string;
}

function elements(node: React.ReactNode): React.ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement<ElementProps>(node)) return [];
  return [node as React.ReactElement<ElementProps>, ...elements((node as React.ReactElement<ElementProps>).props.children)];
}

function renderHome() {
  const router: AppRouterInstance = {
    bfcacheId: "",
    back() {},
    forward() {},
    refresh() {},
    push() {},
    replace() {},
    prefetch() {},
  };
  let tree: React.ReactNode;
  function Probe(): null {
    tree = HomePageClient({ featuredProducts: [], categories: [], initialCategory: "all" });
    return null;
  }
  renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: router }, React.createElement(Probe)));
  return elements(tree);
}

describe("HomePageClient - Spec Sheet homepage", () => {
  it("renders the homepage wrapper", () => {
    const nodes = renderHome();
    assert.ok(nodes.length > 0);
  });

  it("keeps the isolate wrapper and avoids a white page background", () => {
    const nodes = renderHome();
    assert.ok(nodes[0].props.className?.includes("isolate"));
    assert.ok(!nodes[0].props.className?.split(" ").includes("bg-white"));
  });
});
