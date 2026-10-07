import assert from 'node:assert/strict';
import { afterEach, describe, it, mock, type TestContext } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InteractiveDotGrid } from './InteractiveDotGrid';

interface DrawnDot { x: number; y: number; radius: number; alpha: number }

// Run the real component effect against a deterministic canvas and frame queue.
// No DOM package or wall-clock animation timers are needed for these unit tests.
function mountGrid(t: TestContext, options: {
  width?: number;
  height?: number;
  reducedMotion?: boolean;
  missingCanvas?: boolean;
  missingContext?: boolean;
} = {}) {
  let dots: DrawnDot[] = [];
  let position = { x: 0, y: 0, radius: 0 };
  const context = {
    fillStyle: '',
    clearRect: mock.fn(() => { dots = []; }),
    beginPath: mock.fn(),
    arc: mock.fn((x: number, y: number, radius: number) => { position = { x, y, radius }; }),
    fill: mock.fn(() => {
      dots.push({ ...position, alpha: Number(context.fillStyle.split(',').at(-1)?.replace(')', '')) });
    }),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: mock.fn(() => options.missingContext ? null : context),
  };
  const browser = Object.assign(new EventTarget(), {
    innerWidth: options.width ?? 84,
    innerHeight: options.height ?? 84,
    matchMedia: mock.fn(() => ({ matches: options.reducedMotion ?? false })),
  });
  const root = new EventTarget();
  const addWindowListener = mock.method(browser, 'addEventListener');
  const removeWindowListener = mock.method(browser, 'removeEventListener');
  const addRootListener = mock.method(root, 'addEventListener');
  const removeRootListener = mock.method(root, 'removeEventListener');
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;
  const requestFrame = mock.fn((callback: FrameRequestCallback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  });
  const cancelFrame = mock.fn((id: number) => { frames.delete(id); });
  const globals = { window: browser, document: { documentElement: root }, requestAnimationFrame: requestFrame, cancelAnimationFrame: cancelFrame };
  const descriptors = Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  let cleanup: ReturnType<React.EffectCallback>;
  let effect: React.EffectCallback | undefined;
  mock.method(React, 'useRef', () => ({ current: options.missingCanvas ? null : canvas }));
  mock.method(React, 'useEffect', (callback: React.EffectCallback) => { effect = callback; });
  const unmount = (): void => {
    if (typeof cleanup === 'function') cleanup();
    cleanup = undefined;
  };
  // Also restore browser globals if an assertion fails before explicit unmount.
  t.after(() => {
    unmount();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  const markup = renderToStaticMarkup(React.createElement(InteractiveDotGrid));
  assert.ok(effect);
  cleanup = effect();
  return {
    canvas, context, browser, root, frames, requestFrame, cancelFrame, markup,
    addWindowListener, removeWindowListener, addRootListener, removeRootListener,
    get dots() { return dots; },
    unmount,
    move(x: number, y: number): void {
      browser.dispatchEvent(Object.assign(new Event('mousemove'), { clientX: x, clientY: y }));
    },
    resize(width: number, height: number): void {
      browser.innerWidth = width;
      browser.innerHeight = height;
      browser.dispatchEvent(new Event('resize'));
    },
    step(): void {
      assert.equal(frames.size, 1, 'exactly one animation loop should be pending');
      const [id, callback] = frames.entries().next().value!;
      frames.delete(id);
      callback(0);
    },
  };
}

afterEach(() => mock.restoreAll());

describe('InteractiveDotGrid', () => {
  it('renders a decorative, non-interactive viewport canvas', (t) => {
    const grid = mountGrid(t);
    assert.match(grid.markup, /aria-hidden="true"/);
    assert.match(grid.markup, /pointer-events-none/);
    assert.match(grid.markup, /fixed inset-0 w-screen h-screen/);
  });

  it('draws the 42px grid once and stays idle without mouse input', (t) => {
    const grid = mountGrid(t);
    assert.equal(grid.canvas.width, 84);
    assert.equal(grid.canvas.height, 84);
    assert.deepEqual(grid.canvas.getContext.mock.calls[0].arguments, ['2d']);
    assert.deepEqual(grid.dots.map(({ x, y }) => [x, y]), [
      [21, 21], [21, 63], [21, 105], [63, 21], [63, 63], [63, 105], [105, 21], [105, 63], [105, 105],
    ]);
    assert.ok(grid.dots.every(dot => dot.radius === 1.8 && dot.alpha === 0.6));
    assert.equal(grid.context.clearRect.mock.callCount(), 1);
    assert.equal(grid.requestFrame.mock.callCount(), 0);
  });

  it('repels nearby dots away from the pointer and brightens displaced dots', (t) => {
    const grid = mountGrid(t);
    grid.move(20, 21);
    assert.ok(grid.dots[0].x > 21);
    assert.equal(grid.dots[0].y, 21);
    assert.ok(grid.dots[0].alpha > 0.6);
    assert.equal(grid.frames.size, 1);
  });

  it('does not move a dot exactly under the pointer or produce non-finite coordinates', (t) => {
    const grid = mountGrid(t);
    grid.move(21, 21);
    assert.deepEqual(grid.dots[0], { x: 21, y: 21, radius: 1.8, alpha: 0.6 });
    grid.step();
    assert.ok(grid.dots.every(dot => Number.isFinite(dot.x) && Number.isFinite(dot.y)));
  });

  it('excludes the exact 200px influence boundary but repels just inside it', (t) => {
    const grid = mountGrid(t);
    grid.move(-179, 21);
    assert.equal(grid.dots[0].x, 21);
    assert.equal(grid.frames.size, 0);
    grid.move(-178, 21);
    assert.ok(grid.dots[0].x > 21);
    assert.equal(grid.frames.size, 1);
  });

  it('keeps distant pointer movement idle', (t) => {
    const grid = mountGrid(t);
    const initial = grid.dots;
    grid.move(1000, 1000);
    assert.deepEqual(grid.dots, initial);
    assert.equal(grid.frames.size, 0);
  });

  it('does not start duplicate loops during repeated mouse moves and active resizing', (t) => {
    const grid = mountGrid(t);
    grid.move(20, 21);
    grid.move(25, 21);
    grid.move(30, 21);
    grid.resize(126, 42);
    assert.equal(grid.requestFrame.mock.callCount(), 1);
    grid.step();
    assert.equal(grid.dots.length, 8);
    assert.equal(grid.frames.size, 1);
  });

  it('caps brightness during sustained repulsion', (t) => {
    const grid = mountGrid(t);
    grid.move(20, 21);
    for (let frame = 0; frame < 40; frame++) grid.step();
    assert.ok(grid.dots.every(dot => dot.alpha >= 0.6 && dot.alpha <= 0.85));
    assert.ok(grid.dots.some(dot => dot.alpha === 0.85), 'exercise the cap, not just the base opacity');
  });

  it('settles near the original positions after mouseleave, then resumes on new input', (t) => {
    const grid = mountGrid(t);
    const origins = grid.dots;
    grid.move(20, 21);
    for (let frame = 0; frame < 20; frame++) grid.step();
    grid.root.dispatchEvent(new Event('mouseleave'));
    for (let frame = 0; frame < 300 && grid.frames.size; frame++) grid.step();
    assert.equal(grid.frames.size, 0, 'animation should stop after settling');
    grid.dots.forEach((dot, index) => {
      const distance = Math.hypot(dot.x - origins[index].x, dot.y - origins[index].y);
      assert.ok(distance < 1, `dot ${index} settled ${distance}px from its origin`);
    });
    grid.move(20, 21);
    assert.equal(grid.frames.size, 1);
  });

  it('redraws an idle grid at the new viewport size without retaining old dots', (t) => {
    const grid = mountGrid(t);
    grid.resize(42, 126);
    assert.equal(grid.canvas.width, 42);
    assert.equal(grid.canvas.height, 126);
    assert.equal(grid.dots.length, 8);
    assert.ok(grid.dots.some(dot => dot.y === 147));
    assert.ok(grid.dots.every(dot => dot.x <= 63));
    assert.equal(grid.frames.size, 0);
  });

  it('draws a static grid for reduced motion without scheduling frames or pointer listeners', (t) => {
    const grid = mountGrid(t, { reducedMotion: true });
    assert.deepEqual(grid.browser.matchMedia.mock.calls[0].arguments, ['(prefers-reduced-motion: reduce)']);
    assert.equal(grid.dots.length, 9);
    const initial = grid.dots;
    grid.move(20, 21);
    assert.deepEqual(grid.dots, initial);
    assert.equal(grid.requestFrame.mock.callCount(), 0);
    assert.equal(grid.addWindowListener.mock.callCount(), 0);
    assert.equal(grid.addRootListener.mock.callCount(), 0);
  });

  for (const missing of ['missingCanvas', 'missingContext'] as const) {
    it(`exits safely with ${missing}`, (t) => {
      const grid = mountGrid(t, { [missing]: true });
      assert.equal(grid.context.clearRect.mock.callCount(), 0);
      assert.equal(grid.requestFrame.mock.callCount(), 0);
      assert.equal(grid.addWindowListener.mock.callCount(), 0);
      assert.equal(grid.addRootListener.mock.callCount(), 0);
    });
  }

  it('cancels the pending frame and removes every listener on unmount', (t) => {
    const grid = mountGrid(t);
    grid.move(20, 21);
    const pending = [...grid.frames.keys()][0];
    grid.unmount();
    assert.deepEqual(grid.cancelFrame.mock.calls[0].arguments, [pending]);
    assert.equal(grid.frames.size, 0);
    assert.deepEqual(grid.removeWindowListener.mock.calls.map(call => call.arguments), grid.addWindowListener.mock.calls.map(call => call.arguments));
    assert.deepEqual(grid.removeRootListener.mock.calls.map(call => call.arguments), grid.addRootListener.mock.calls.map(call => call.arguments));
    const draws = grid.context.clearRect.mock.callCount();
    grid.move(20, 21);
    grid.resize(420, 420);
    grid.root.dispatchEvent(new Event('mouseleave'));
    assert.equal(grid.context.clearRect.mock.callCount(), draws);
    assert.equal(grid.frames.size, 0);
  });
});
