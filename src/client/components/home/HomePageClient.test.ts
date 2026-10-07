import assert from 'node:assert/strict';
import { afterEach, describe, it, mock, type TestContext } from 'node:test';
import React, { type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppRouterContext, type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import gsap from 'gsap';
import HomePageClient from './HomePageClient';
import { InteractiveDotGrid } from '../common/InteractiveDotGrid';

interface ElementProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  src?: string;
  alt?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  'aria-hidden'?: string;
}

// Inspect the component's own React tree without mounting unrelated child widgets.
function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

function renderHome() {
  const effects: React.EffectCallback[] = [];
  const refs: React.RefObject<unknown>[] = [];
  const useRef = React.useRef;
  const effectMock = mock.method(React, 'useEffect', (effect: React.EffectCallback) => { effects.push(effect); });
  const refMock = mock.method(React, 'useRef', <T,>(initial: T) => {
    const ref = useRef(initial);
    refs.push(ref);
    return ref;
  });
  const router: AppRouterInstance = {
    back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {},
  };
  let tree: ReactNode;
  function Probe(): null {
    tree = HomePageClient({ featuredProducts: [], categories: [], initialCategory: 'empty' });
    return null;
  }
  try {
    renderToStaticMarkup(React.createElement(AppRouterContext.Provider, { value: router }, React.createElement(Probe)));
  } finally {
    effectMock.mock.restore();
    refMock.mock.restore();
  }
  // The page's animation effect is registered after its motion-value hooks.
  const animate = effects.at(-1);
  assert.ok(animate);
  assert.ok(refs[0]);
  return { nodes: elements(tree), containerRef: refs[0], animate };
}

function animateHome(t: TestContext, options: { reducedMotion?: boolean; headerCount?: number; hero?: boolean; missingContainer?: boolean } = {}) {
  const page = renderHome();
  const headers = Array.from({ length: options.headerCount ?? 2 }, () => ({ children: [{}, {}] }));
  const hero = options.hero === false ? null : {};
  const container = {
    querySelectorAll: (selector: string) => selector === '.section-header' ? headers : [],
    querySelector: (selector: string) => selector === '.hero-section' ? hero : null,
  };
  page.containerRef.current = options.missingContainer ? null : container;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const matchMedia = mock.fn(() => ({ matches: options.reducedMotion ?? false }));
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { matchMedia } });
  let cleanup: ReturnType<React.EffectCallback>;
  t.after(() => {
    if (typeof cleanup === 'function') cleanup();
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const to = mock.method(gsap, 'to', () => ({} as gsap.core.Tween));
  const fromTo = mock.method(gsap, 'fromTo', () => ({} as gsap.core.Tween));
  const timeline = { fromTo: (): gsap.core.Timeline => timeline as unknown as gsap.core.Timeline };
  mock.method(gsap, 'timeline', () => timeline as unknown as gsap.core.Timeline);
  const revert = mock.fn();
  const context = mock.method(gsap, 'context', (callback: () => void) => {
    callback();
    return { revert } as unknown as gsap.Context;
  });
  cleanup = page.animate();
  return {
    ...page, headers, hero, to, fromTo, context, revert, matchMedia,
    unmount(): void {
      if (typeof cleanup === 'function') cleanup();
      cleanup = undefined;
    },
  };
}

afterEach(() => mock.restoreAll());

describe('HomePageClient — PR #55 background and animations', () => {
  it('composes one decorative fixed texture and dot grid below the foreground sections', () => {
    const { nodes } = renderHome();
    assert.ok(nodes[0].props.className?.split(' ').includes('isolate'));
    assert.ok(!nodes[0].props.className?.split(' ').includes('bg-white'));
    const background = nodes.find(node => node.props['aria-hidden'] === 'true' && node.props.style?.zIndex === 1);
    assert.ok(background);
    assert.ok(background.props.className?.includes('fixed inset-0 pointer-events-none'));
    const backgroundNodes = elements(background);
    assert.equal(backgroundNodes.filter(node => node.type === InteractiveDotGrid).length, 1);
    const textures = backgroundNodes.filter(node => node.props.src === '/images/NewUI.webp');
    assert.equal(textures.length, 1);
    assert.equal(textures[0].props.alt, '');
    assert.equal(textures[0].props.fill, true);
    assert.equal(textures[0].props.priority, true);
    assert.equal(textures[0].props.sizes, '100vw');
    const sections = nodes.filter(node => node.type === 'section');
    assert.ok(sections.length > 0);
    assert.ok(sections.every(section => section.props.className?.includes('z-[10]')));
  });

  it('connects the hero and all five section headers to their animation selectors', () => {
    const { nodes } = renderHome();
    const hero = nodes.find(node => node.props.className?.split(' ').includes('hero-section'));
    assert.ok(hero);
    assert.ok(elements(hero).some(node => node.props.className?.split(' ').includes('hero-inner')));
    const headers = nodes.filter(node => node.props.className?.split(' ').includes('section-header'));
    assert.equal(headers.length, 5);
    assert.ok(headers.every(header => elements(header).some(node => node.type === 'h2')));
  });

  it('reveals each header independently when it enters the viewport', (t) => {
    const page = animateHome(t);
    assert.equal(page.fromTo.mock.callCount(), page.headers.length);
    page.headers.forEach((header, index) => {
      const [target, from, to] = page.fromTo.mock.calls[index].arguments;
      assert.equal(target, header.children);
      assert.deepEqual(from, { opacity: 0, y: 20 });
      assert.ok(to);
      assert.equal(to.opacity, 1);
      assert.equal(to.y, 0);
      assert.ok(Number(to.stagger) > 0);
      assert.deepEqual(to.scrollTrigger, { trigger: header, start: 'top 85%', toggleActions: 'play none none none' });
    });
  });

  it('scrubs the hero exit across the hero section and scopes cleanup to the page', (t) => {
    const page = animateHome(t);
    const heroTweens = page.to.mock.calls.filter(call => call.arguments[0] === '.hero-inner');
    assert.equal(heroTweens.length, 1);
    const vars = heroTweens[0].arguments[1];
    assert.ok(vars);
    assert.equal(vars.opacity, 0);
    assert.equal(vars.yPercent, 15);
    assert.equal(vars.ease, 'none');
    assert.deepEqual(vars.scrollTrigger, { trigger: page.hero, start: 'top top', end: 'bottom top', scrub: true });
    assert.equal(page.context.mock.calls[0].arguments[1], page.containerRef);
    page.unmount();
    assert.equal(page.revert.mock.callCount(), 1);
  });

  it('omits the new header and hero-exit animations when reduced motion is requested', (t) => {
    const page = animateHome(t, { reducedMotion: true });
    assert.deepEqual(page.matchMedia.mock.calls[0].arguments, ['(prefers-reduced-motion: reduce)']);
    assert.equal(page.fromTo.mock.callCount(), 0);
    assert.equal(page.to.mock.calls.filter(call => call.arguments[0] === '.hero-inner').length, 0);
    page.unmount();
    assert.equal(page.revert.mock.callCount(), 1);
  });

  it('skips hero exit if the hero element is absent while still revealing headers', (t) => {
    const page = animateHome(t, { hero: false });
    assert.equal(page.fromTo.mock.callCount(), page.headers.length);
    assert.equal(page.to.mock.calls.filter(call => call.arguments[0] === '.hero-inner').length, 0);
  });

  it('supports an empty header collection while preserving hero exit', (t) => {
    const page = animateHome(t, { headerCount: 0 });
    assert.equal(page.fromTo.mock.callCount(), 0);
    assert.equal(page.to.mock.calls.filter(call => call.arguments[0] === '.hero-inner').length, 1);
  });

  it('handles an unavailable container and still returns cleanup', (t) => {
    const page = animateHome(t, { missingContainer: true });
    assert.equal(page.fromTo.mock.callCount(), 0);
    assert.equal(page.to.mock.calls.filter(call => call.arguments[0] === '.hero-inner').length, 0);
    page.unmount();
    assert.equal(page.revert.mock.callCount(), 1);
  });
});
