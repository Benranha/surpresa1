---
name: gsap-scrolltrigger
description: Use when building scroll-driven sequences with GSAP ScrollTrigger — pinning sections, scrub animations, horizontal scroll panels, scrollytelling, snap-to-section, batch reveals. Covers full config (trigger/start/end/scrub/pin/toggleActions/markers), React integration with `useGSAP`, Lenis sync, refresh patterns, and the ScrollSmoother vs Lenis decision. As of 2024+ GSAP core + ScrollTrigger are free.
---

# GSAP ScrollTrigger — Production Reference

ScrollTrigger is the most powerful scroll-animation tool in the JS ecosystem. As of 2024, **GSAP core, ScrollTrigger, MorphSVG, DrawSVG, and most former premium plugins are free for all use including commercial**.

## Mental model

A ScrollTrigger has two jobs:

1. **Where in the scroll** does it start/end? → `trigger`, `start`, `end`
2. **What happens** during that range? Either:
   - **Toggle**: play/pause an animation at thresholds (`toggleActions`)
   - **Scrub**: tie animation progress 1:1 to scroll progress (`scrub`)

## Install

```bash
npm i gsap
# React only:
npm i gsap @gsap/react
```

```js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

## The 4 core patterns

### Pattern 1 — One-shot reveal (toggleActions)

```js
gsap.from('.hero-text', {
  y: 60, autoAlpha: 0, duration: 1,
  scrollTrigger: {
    trigger: '.hero-text',
    start: 'top 85%',           // when top of element hits 85% down the viewport
    toggleActions: 'play none none reverse', // onEnter onLeave onEnterBack onLeaveBack
  },
});
```

`toggleActions` values: `play | pause | resume | reverse | restart | reset | complete | none`
Order: `onEnter onLeave onEnterBack onLeaveBack`.

Common recipes:
- `'play none none none'` → play once, never reverse
- `'play reverse play reverse'` → bidirectional
- `'restart pause resume reverse'` → fully interactive

### Pattern 2 — Scrub (scroll-linked progress)

```js
gsap.to('.parallax-img', {
  yPercent: -30,
  ease: 'none',                 // ALWAYS ease: 'none' with scrub
  scrollTrigger: {
    trigger: '.parallax-section',
    start: 'top bottom',        // enters
    end: 'bottom top',          // exits
    scrub: 1,                   // 1s catch-up smoothing; true = instant
  },
});
```

> With `scrub`, use `ease: 'none'` — easing curves on top of scroll position feel wrong.

### Pattern 3 — Pin + timeline (scrollytelling)

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.story',
    start: 'top top',
    end: '+=2500',             // 2500px of scroll = duration of pin
    pin: true,
    scrub: 1,
    anticipatePin: 1,           // prevents 1-frame flash before pinning
    invalidateOnRefresh: true,
  },
});

tl.from('.chapter-1', { autoAlpha: 0, y: 60 })
  .to('.bg-image', { scale: 1.2, x: '-15%' }, '<')   // '<' = start of previous
  .from('.chapter-2', { autoAlpha: 0, y: 60 }, '+=0.5');
```

### Pattern 4 — Horizontal scroll (vertical scroll → horizontal motion)

```js
const sections = gsap.utils.toArray('.h-panel');
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: 'none',
  scrollTrigger: {
    trigger: '.h-wrapper',
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => '+=' + document.querySelector('.h-wrapper').offsetWidth,
  },
});
```

```css
.h-wrapper { overflow: hidden; }
.h-wrapper > div { display: flex; width: 400vw; height: 100vh; }
.h-panel { width: 100vw; height: 100vh; flex: 0 0 100vw; }
```

## Config reference

| Property              | Default          | Notes                                                              |
| --------------------- | ---------------- | ------------------------------------------------------------------ |
| `trigger`             | required         | Element/selector that drives start/end                             |
| `start`               | `'top bottom'`   | `"[trigger-pos] [viewport-pos]"`. Px/% allowed. Or function.       |
| `end`                 | `'bottom top'`   | Same syntax. Or `"+=500"` for relative offset.                     |
| `scrub`               | `false`          | `true` = instant, number = seconds catch-up                        |
| `pin`                 | `false`          | `true` or element selector                                         |
| `pinSpacing`          | `true`           | Add padding to compensate for pinned element                       |
| `anticipatePin`       | `0`              | `1` recommended when `pin: true` to avoid 1-frame jump             |
| `toggleActions`       | `'play none none none'` | See Pattern 1                                               |
| `markers`             | `false`          | Show debug start/end lines. Turn on while developing.              |
| `invalidateOnRefresh` | `false`          | Recompute on resize/orientation change                             |
| `once`                | `false`          | Auto-kill after first completion                                   |
| `snap`                | `false`          | `1/n` to snap to fractions; or `{ snapTo, duration, ease }`        |
| `onEnter/Leave/Update`| -                | Lifecycle callbacks for custom behavior                            |
| `toggleClass`         | -                | Adds class while in range — handy for CSS-driven changes           |

## React integration (App Router safe)

```tsx
'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Section() {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from('.fade-up', {
      y: 60, autoAlpha: 0, stagger: 0.1,
      scrollTrigger: { trigger: '.fade-up', start: 'top 85%' },
    });
  }, { scope });
  return <div ref={scope}>…</div>;
}
```

`useGSAP` automatically kills all animations/ScrollTriggers created inside it on unmount — no manual cleanup needed.

## Lenis sync (the must-know recipe)

```js
import Lenis from 'lenis';
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

See the `smooth-scroll-lenis` skill for full details.

## Refresh patterns (critical)

ScrollTrigger snapshots positions on creation. If the DOM size changes (fonts load, images decode, content is added) without a refresh, triggers fire at the wrong scroll positions.

```js
// After fonts:
document.fonts.ready.then(() => ScrollTrigger.refresh());

// After images:
window.addEventListener('load', () => ScrollTrigger.refresh());

// In React after lazy data loads:
useEffect(() => { ScrollTrigger.refresh(); }, [data]);
```

## Batch (efficient many-trigger reveals)

When you have 100+ elements that should reveal as they enter the viewport, use `ScrollTrigger.batch` — it groups them so the browser only does one layout pass.

```js
ScrollTrigger.batch('.card', {
  start: 'top 90%',
  onEnter: (els) => gsap.from(els, { autoAlpha: 0, y: 40, stagger: 0.1 }),
});
```

## ScrollSmoother vs Lenis (decision)

| Use **ScrollSmoother** when | Use **Lenis** when                          |
| --------------------------- | ------------------------------------------- |
| Whole project is GSAP-first | You want flexibility / framework freedom    |
| You want effects like `data-speed` baked in | You have non-standard / layered layouts |
| You're OK with the wrapper DOM requirement  | You want minimal architectural impact   |

For most React/Next projects in 2026 the community consensus is **Lenis + ScrollTrigger**.

## Accessibility

Wrap motion-heavy animations:

```js
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.to('.hero', { y: -100, scrollTrigger: { … } });
  // returned cleanup runs when media query no longer matches
  return () => { /* GSAP auto-cleans inside matchMedia */ };
});
```

## Common pitfalls

- Forgetting `ease: 'none'` with `scrub` → animation lags behind scroll.
- `pin: true` without `anticipatePin: 1` → 1-frame visible jump at pin moment.
- Building ScrollTriggers inside a React component without `useGSAP` → leaks on re-render.
- Building before images load and never calling `ScrollTrigger.refresh()` → triggers fire at wrong scroll positions.
- Using `start: 'top 0%'` inside a Lenis project before calling the sync recipe → ScrollTrigger reads native scroll, Lenis controls something else.
- `pin: true` on an element that is itself inside an `overflow: hidden` container → silently breaks.
- 100 individual ScrollTriggers for a card grid → use `ScrollTrigger.batch` instead.

## Debugging

```js
ScrollTrigger.defaults({ markers: true }); // turn on for all (dev only)
console.log(ScrollTrigger.getAll());        // list every trigger
ScrollTrigger.refresh(true);                // force full re-measure
```

In React DevTools, ensure components using ScrollTrigger are not double-mounting in Strict Mode without `useGSAP` to clean up.

## Related skills

- `smooth-scroll-lenis` — must-pair for smooth feel
- `scroll-animations` — for lightweight IO-based reveals (when GSAP is overkill)
- `parallax-effects` — for layer-speed math that ScrollTrigger automates
- `scroll-performance-a11y` — for performance + reduced-motion rules
