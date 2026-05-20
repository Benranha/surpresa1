---
name: smooth-scroll-lenis
description: Use when adding momentum/smooth scrolling with Lenis (the 2026 industry-standard, ~3KB). Covers vanilla setup, React (`lenis/react`) integration, GSAP ScrollTrigger sync (the critical recipe), config options (lerp, duration, syncTouch, easing), scrollTo, scroll-locking modals (`data-lenis-prevent`), Next.js App Router patterns, and accessibility (prefers-reduced-motion). Excludes legacy `@studio-freight/*` packages — those were retired.
---

# Lenis Smooth Scroll — Setup & Integration

Lenis (by Darkroom Engineering, formerly Studio Freight) is the de-facto smooth-scroll library in 2026. ~3KB gzipped, doesn't break `position: sticky`, plays nice with ScrollTrigger.

## Install

```bash
npm i lenis
# React wrapper:
npm i lenis @gsap/react gsap
```

> **Important:** Do NOT install `@studio-freight/lenis` or `@studio-freight/react-lenis`. Those packages were renamed when Studio Freight became Darkroom Engineering. Use `lenis` and `lenis/react`.

## Recipe 1 — Vanilla JS (the canonical 8 lines)

```js
import Lenis from 'lenis';
import 'lenis/dist/lenis.css'; // optional: hides scrollbar styling helpers

const lenis = new Lenis();
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

Or with auto-RAF:

```js
const lenis = new Lenis({ autoRaf: true });
lenis.on('scroll', (e) => console.log(e.scroll, e.velocity, e.direction));
```

## Recipe 2 — React (App Router / Next.js 15+)

```tsx
// app/providers/LenisProvider.tsx
'use client';
import { ReactLenis } from 'lenis/react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, syncTouch: false }}>
      {children}
    </ReactLenis>
  );
}
```

```tsx
// app/layout.tsx
import LenisProvider from './providers/LenisProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><LenisProvider>{children}</LenisProvider></body>
    </html>
  );
}
```

Inside any component, access the instance:

```tsx
'use client';
import { useLenis } from 'lenis/react';

export function BackToTop() {
  const lenis = useLenis();
  return <button onClick={() => lenis?.scrollTo(0, { duration: 1.6 })}>↑</button>;
}
```

## Recipe 3 — GSAP ScrollTrigger sync (THE recipe)

This is the most common integration. Lenis controls scroll position, ScrollTrigger reads it.

```js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis();
// 1. Tell ScrollTrigger to update whenever Lenis scrolls
lenis.on('scroll', ScrollTrigger.update);
// 2. Drive Lenis from GSAP's ticker (single rAF for both)
gsap.ticker.add((time) => lenis.raf(time * 1000)); // GSAP uses seconds, Lenis ms
// 3. Disable GSAP's automatic lag smoothing — Lenis handles timing
gsap.ticker.lagSmoothing(0);
```

After fonts/images load, call `ScrollTrigger.refresh()` to recompute trigger offsets:

```js
window.addEventListener('load', () => ScrollTrigger.refresh());
```

## Configuration reference

| Option            | Default        | Use it when                                            |
| ----------------- | -------------- | ------------------------------------------------------ |
| `lerp`            | `0.1`          | Lower (`0.05`) = floatier; higher (`0.2`) = snappier   |
| `duration`        | `1.2`          | Only used when `lerp` is null. Length of catch-up.     |
| `easing`          | exponential    | Custom curve: `(t) => 1 - Math.pow(1 - t, 4)` etc.     |
| `smoothWheel`     | `true`         | Disable to let trackpad gestures feel native           |
| `syncTouch`       | `false`        | Enable to extend smooth feel to mobile touch (use with care — mobile users expect native scroll) |
| `wheelMultiplier` | `1`            | Boost wheel sensitivity                                |
| `touchMultiplier` | `1`            | Boost touch sensitivity                                |
| `autoRaf`         | `false`        | Skip writing your own rAF loop                         |
| `overscroll`      | `true`         | Allow rubber-band overshoot                            |
| `infinite`        | `false`        | Endless scroll mode (advanced)                         |

> `smoothTouch` was removed. Use `syncTouch: true` for the modern equivalent.

## API cheatsheet

```js
// Navigation
lenis.scrollTo('#section-3', {
  offset: -80,          // sticky header height
  duration: 1.6,
  easing: (t) => 1 - Math.pow(1 - t, 3),
  immediate: false,
  lock: true,           // prevent user scroll during animation
  onComplete: () => {},
});

// Control
lenis.stop();           // pause scrolling (modal open)
lenis.start();          // resume
lenis.resize();         // recompute size (after layout change)
lenis.destroy();        // tear down

// State (read these in your own rAF, don't poll)
lenis.scroll      // current Y
lenis.velocity    // current velocity (px/frame)
lenis.progress    // 0..1 normalized
lenis.direction   // 1 (down) | -1 (up) | 0
lenis.isScrolling // boolean

// Events
lenis.on('scroll', ({ scroll, velocity, direction, progress }) => { … });
lenis.on('virtual-scroll', ({ deltaX, deltaY, event }) => { … }); // raw input
```

## Modals & scroll-locked containers

Lenis hijacks the page scroll, which breaks modal scrolling and nested scrollables. Two fixes:

```html
<!-- Tell Lenis to ignore this element entirely -->
<div class="modal" data-lenis-prevent>…</div>

<!-- Or only prevent wheel events -->
<div class="overflow-y-auto" data-lenis-prevent-wheel>…</div>

<!-- Or only prevent touch -->
<div class="overflow-y-auto" data-lenis-prevent-touch>…</div>
```

In code, you can also `lenis.stop()` when opening a fullscreen modal and `lenis.start()` on close.

## Accessibility — don't ship without this

```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = new Lenis({
  lerp: reduce ? 1 : 0.1,        // lerp:1 → instant scroll (effectively native)
  smoothWheel: !reduce,
  syncTouch: false,
});
```

Or just don't instantiate Lenis at all when the user prefers reduced motion. Native scroll is fine.

## Anchor links

If you use `<a href="#section">`, intercept and route through Lenis for smooth jumps:

```js
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id && id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      lenis.scrollTo(id, { offset: -80 });
    }
  });
});
```

## Anti-patterns

- Installing the retired `@studio-freight/lenis` package (use `lenis`).
- Forgetting to call `ScrollTrigger.refresh()` after fonts/images load → triggers drift.
- Running both `gsap.ticker.add(...lenis.raf...)` AND a manual `requestAnimationFrame(raf)` loop → double-stepped scroll.
- Enabling `syncTouch: true` for general audiences → mobile users hate the inertia override.
- Forgetting `data-lenis-prevent` on modals/sidebars → users can't scroll inside.
- Setting `lerp: 0.01` thinking smoother is better → it feels laggy and unresponsive.

## Related skills

- `gsap-scrolltrigger` — for the animation half of the Lenis+GSAP pair
- `parallax-effects` — Lenis enables smoother parallax math
- `scroll-performance-a11y` — for the reduced-motion + performance rules
