import assert from 'node:assert/strict';
import { afterEach, describe, it, mock, type TestContext } from 'node:test';
import React, { type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AppRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import gsap from 'gsap';
import NavbarClient from './NavbarClient';
import { vi } from '@/i18n/dictionaries/vi';

const ROUTER: AppRouterInstance = {
  bfcacheId: '',
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
};

const NAV_LINKS = [
  { label: vi.nav.home, href: '/' },
  { label: vi.nav.templates, href: '/shop' },
  { label: vi.nav.portfolio, href: '/portfolio' },
  { label: vi.nav.contact, href: '/contact' },
];

function renderNavbar(): string {
  function Probe(): null {
    return NavbarClient({
      user: null,
      brandName: 'KhoUI',
      navLinks: NAV_LINKS,
      dict: {},
    }) as unknown as null;
  }

  return renderToStaticMarkup(
    React.createElement(
      AppRouterContext.Provider,
      { value: ROUTER },
      React.createElement(
        PathnameContext.Provider,
        { value: '/' },
        React.createElement(Probe)
      )
    )
  );
}

afterEach(() => mock.restoreAll());

describe('NavbarClient — Spec Sheet chrome', () => {
  it('renders the editorial wordmark, announcement strip and sticky hairline bar', () => {
    const html = renderNavbar();

    assert.match(html, /LogoKhoUI\.png/);
    assert.match(html, new RegExp(vi.nav.topbarTech));
    assert.match(html, new RegExp(vi.nav.topbarLicense));
    assert.match(html, /sticky top-0 z-\[990\]/);
    assert.match(html, /border-b border-border/);
    assert.match(html, new RegExp(vi.nav.searchAria));
  });

  it('renders every navigation link plus the explored catalogue call to action', () => {
    const html = renderNavbar();

    for (const link of NAV_LINKS) {
      assert.match(html, new RegExp(`href="${link.href}"`));
      assert.match(html, new RegExp(link.label));
    }

    assert.match(html, new RegExp(vi.nav.explore));
    assert.match(html, /href="\/shop"/);
    assert.match(html, /aria-expanded="false"/);
  });

  it('keeps the cart, language switcher and mobile menu toggle in the action rail', () => {
    const html = renderNavbar();

    assert.match(html, new RegExp(vi.nav.menuOpen));
    assert.match(html, new RegExp(vi.nav.login));
    assert.match(html, />vi<\/span>/);
    assert.match(html, /Giỏ hàng/);
  });
});

describe('NavbarClient — effect lifecycle', () => {
  function mountEffects(t: TestContext) {
    const browser = Object.assign(new EventTarget(), { scrollY: 0 });
    const addListener = mock.method(browser, 'addEventListener');
    const removeListener = mock.method(browser, 'removeEventListener');
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });

    const effects: React.EffectCallback[] = [];
    const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback) => {
      effects.push(effect);
    });

    let tree: ReactNode;
    function Probe(): null {
      tree = NavbarClient({
        user: null,
        brandName: 'KhoUI',
        navLinks: NAV_LINKS,
        dict: {},
      }) as unknown as null;
      return null;
    }

    renderToStaticMarkup(
      React.createElement(
        AppRouterContext.Provider,
        { value: ROUTER },
        React.createElement(
          PathnameContext.Provider,
          { value: '/' },
          React.createElement(Probe)
        )
      )
    );
    effectMock.mock.restore();

    const revert = mock.fn();
    const context = mock.method(gsap, 'context', () => ({ revert }) as unknown as gsap.Context);

    const cleanups: Array<() => void> = [];
    for (const effect of effects) {
      const cleanup = effect();
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    }

    t.after(() => {
      cleanups.splice(0).forEach((cleanup) => cleanup());
      if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    });

    return {
      tree: tree as ReactNode,
      addListener,
      removeListener,
      context,
      revert,
      unmount(): void {
        cleanups.splice(0).forEach((cleanup) => cleanup());
      },
    };
  }

  it('registers the keyboard shortcut listener and removes it on unmount', (t) => {
    const mount = mountEffects(t);

    const added = mount.addListener.mock.calls.filter((call) => call.arguments[0] === 'keydown');
    assert.equal(added.length, 1);

    mount.unmount();
    const removed = mount.removeListener.mock.calls.filter((call) => call.arguments[0] === 'keydown');
    assert.equal(removed.length, 1);
    assert.equal(removed[0].arguments[1], added[0].arguments[1]);
  });

  it('scopes scroll state to a GSAP context and reverts it on unmount', (t) => {
    const mount = mountEffects(t);

    assert.equal(mount.context.mock.callCount(), 1);
    mount.unmount();
    assert.equal(mount.revert.mock.callCount(), 1);
  });
});
