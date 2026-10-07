import assert from 'node:assert/strict';
import { afterEach, describe, it, mock, type TestContext } from 'node:test';
import React, { type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppRouterContext, type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import gsap from 'gsap';
import NavbarClient from './NavbarClient';

interface ElementProps { children?: ReactNode; className?: string }

function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

function mountNavbar(t: TestContext) {
  const browser = Object.assign(new EventTarget(), { scrollY: 0 });
  const addListener = mock.method(browser, 'addEventListener');
  const removeListener = mock.method(browser, 'removeEventListener');
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  const cleanups: Array<() => void> = [];
  const unmount = (): void => { cleanups.splice(0).forEach(cleanup => cleanup()); };
  t.after(() => {
    unmount();
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const revert = mock.fn();
  mock.method(gsap, 'context', () => ({ revert }) as unknown as gsap.Context);
  const router: AppRouterInstance = {
    back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {},
  };
  let isScrolled = false;
  let effects: React.EffectCallback[] = [];

  function render(): ReactElement<ElementProps>[] {
    effects = [];
    let tree: ReactNode;
    let stateIndex = 0;
    const useState = React.useState;
    // Control only the navbar's first (scroll) state. Keep the other React hooks
    // real, and rerender explicitly after dispatching browser scroll events.
    const stateMock = mock.method(React, 'useState', ((initial: unknown) => {
      if (stateIndex++ === 0) return [isScrolled, (value: boolean) => { isScrolled = value; }];
      return useState(initial);
    }) as typeof React.useState);
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback) => { effects.push(effect); });
    function Probe(): null {
      tree = NavbarClient({ user: null, brandName: 'KhoUI', navLinks: [], dict: {} });
      return null;
    }
    try {
      renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: router },
        React.createElement(PathnameContext.Provider, { value: '/' }, React.createElement(Probe))));
    } finally {
      stateMock.mock.restore();
      effectMock.mock.restore();
    }
    return elements(tree);
  }

  const initialNodes = render();
  for (const effect of effects) {
    const cleanup = effect();
    if (typeof cleanup === 'function') cleanups.push(cleanup);
  }
  return {
    initialNodes, addListener, removeListener, revert, unmount,
    scroll(y: number): Set<string> {
      browser.scrollY = y;
      browser.dispatchEvent(new Event('scroll'));
      const nav = render().find(node => node.type === 'nav');
      assert.ok(nav);
      return new Set(nav.props.className?.split(/\s+/));
    },
  };
}

afterEach(() => mock.restoreAll());

describe('NavbarClient — transparent and frosted states', () => {
  it('starts transparent and keeps navigation and announcements above the background', (t) => {
    const page = mountNavbar(t);
    const nav = page.initialNodes.find(node => node.type === 'nav');
    assert.ok(nav);
    const classes = new Set(nav.props.className?.split(/\s+/));
    assert.ok(classes.has('bg-transparent'));
    assert.ok(classes.has('h-[68px]'));
    assert.ok(classes.has('sticky') && classes.has('top-0') && classes.has('z-[990]'));
    assert.ok(page.initialNodes.some(node => node.props.className?.includes('relative z-[100]')));
  });

  it('stays transparent at and below 20px, frosts above 20px, and restores on return', (t) => {
    const page = mountNavbar(t);
    for (const y of [-1, 0, 19, 20, 21, 200, 20, 0]) {
      const classes = page.scroll(y);
      assert.equal(classes.has('bg-transparent'), y <= 20, `transparent at scrollY=${y}`);
      assert.equal(classes.has('bg-white/60'), y > 20, `frosted at scrollY=${y}`);
      assert.equal(classes.has('backdrop-blur-md'), y > 20);
      assert.equal(classes.has('h-[62px]'), y > 20);
      assert.equal(classes.has('h-[68px]'), y <= 20);
    }
  });

  it('retains hover glass styling in both scroll states', (t) => {
    const page = mountNavbar(t);
    for (const y of [0, 21]) {
      const classes = page.scroll(y);
      assert.ok(classes.has('hover:bg-white/95'));
      assert.ok(classes.has('hover:backdrop-blur-md'));
      assert.ok(classes.has('transition-all') && classes.has('duration-300'));
    }
  });

  it('uses a passive scroll listener and removes it on unmount', (t) => {
    const page = mountNavbar(t);
    const scrollCalls = page.addListener.mock.calls.filter(call => call.arguments[0] === 'scroll');
    assert.equal(scrollCalls.length, 1);
    assert.deepEqual(scrollCalls[0].arguments[2], { passive: true });
    page.scroll(21);
    page.unmount();
    const removed = page.removeListener.mock.calls.filter(call => call.arguments[0] === 'scroll');
    assert.equal(removed.length, 1);
    assert.equal(removed[0].arguments[1], scrollCalls[0].arguments[1]);
    assert.equal(page.revert.mock.callCount(), 1);
    assert.ok(page.scroll(0).has('bg-white/60'), 'scrolling after unmount must not update state');
  });
});
