import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import React, { type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import StorefrontLayout from './layout';
import { Footer } from '@/client/components/layout/Footer';
import { Navbar } from '@/client/components/layout/Navbar';
import CartDrawer from '@/client/components/layout/CartDrawer';
import { AutoBreadcrumbs } from '@/client/components/common/AutoBreadcrumbs';

describe('Storefront background layering', () => {
  it('leaves the shell transparent while preserving the main content and shared navigation', () => {
    const content = React.createElement('article', null, 'Page content');
    const layout = StorefrontLayout({ children: content });
    assert.ok(!layout.props.className.split(' ').some((name: string) => name.startsWith('bg-')));
    const children = React.Children.toArray(layout.props.children) as ReactElement<{ children?: ReactNode; className?: string }>[];
    assert.deepEqual(children.map(child => child.type), [Navbar, CartDrawer, AutoBreadcrumbs, 'main', Footer]);
    assert.equal(children[3].props.children, content);
    assert.equal(children[3].props.className, 'flex-grow');
  });

  it('keeps the opaque footer above the fixed homepage background', () => {
    const markup = renderToStaticMarkup(React.createElement(Footer));
    const footer = markup.match(/<footer class="([^"]+)"/);
    assert.ok(footer);
    const classes = new Set(footer[1].split(' '));
    assert.ok(classes.has('relative'));
    assert.ok(classes.has('z-[10]'));
    assert.ok(classes.has('bg-slate-950'));
    assert.ok(classes.has('mt-auto'));
  });
});
