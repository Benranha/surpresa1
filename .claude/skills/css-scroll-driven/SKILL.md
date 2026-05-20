---
name: css-scroll-driven
description: Use when implementing scroll-linked animations with NATIVE CSS — `animation-timeline`, `scroll-timeline`, `view-timeline`, and the `scroll()` / `view()` anonymous-timeline functions. Covers progress bars, reveal-on-view, parallax, named vs anonymous timelines, `animation-range`, the `@supports` fallback pattern, and Firefox's partial support. Zero JavaScript needed in supported browsers.
---

# CSS Scroll-Driven Animations — Native, Zero-JS

Scroll-driven animations let CSS `@keyframes` run against scroll position instead of time. Universal support in Chromium 115+ and Safari 18+. Firefox is behind a flag (as of 2026) — always provide a fallback.

## Two timeline flavors

| Timeline           | Driven by                                        | Use for                       |
| ------------------ | ------------------------------------------------ | ----------------------------- |
| **scroll progress** (`scroll-timeline`, `scroll()`) | Position of a scroll container               | Page progress bar, hero parallax tied to root scroll |
| **view progress**  (`view-timeline`, `view()`)  | Visibility of a subject element in its scroller | Reveal-as-you-enter-viewport, scrollytelling, image zoom |

## Quickest possible — anonymous `scroll()` (progress bar)

```css
.progress {
  position: fixed; top: 0; left: 0; right: 0;
  height: 3px; background: gold;
  transform-origin: 0 50%;
  animation: grow linear;
  animation-timeline: scroll(root block); /* root scroller, vertical axis */
}
@keyframes grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

## Anonymous `view()` (reveal on viewport entry)

```css
.card {
  animation: rise linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 40%;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(60px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### `animation-range` ranges

| Range name | Meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `cover`    | From subject entering the scrollport until it has fully left       |
| `contain`  | Range during which the subject is fully inside the scrollport      |
| `entry`    | From subject starting to enter until fully inside                  |
| `exit`     | From subject starting to leave until fully gone                    |
| `entry-crossing` / `exit-crossing` | More precise crossing definitions                  |

Examples:
- `animation-range: entry 0% entry 100%;` → animate during the entry phase
- `animation-range: cover;` → entire time element is even partially visible
- `animation-range: contain 0% contain 100%;` → only while fully visible

## Named timelines — when you need cross-element wiring

The subject of the timeline can be a different element than the one being animated.

```css
.hero-image {
  view-timeline-name: --hero;
  view-timeline-axis: block;
}
.headline {
  animation: drift linear;
  animation-timeline: --hero;
  animation-range: entry cover;
}
@keyframes drift {
  from { transform: translateX(-40px); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
```

For a `scroll-timeline` (custom scroll container, not root):

```css
.gallery {
  overflow-x: auto;
  scroll-timeline-name: --gallery-x;
  scroll-timeline-axis: inline;
}
.indicator {
  animation: paginate linear;
  animation-timeline: --gallery-x;
}
```

## `scroll()` and `view()` function arguments

```css
/* scroll(<scroller>? <axis>?) */
animation-timeline: scroll();                /* nearest scroller, block axis */
animation-timeline: scroll(root);            /* root (document) scroller */
animation-timeline: scroll(self);            /* element itself if scrollable */
animation-timeline: scroll(nearest);         /* explicit default */
animation-timeline: scroll(root inline);     /* root scroller, horizontal */
animation-timeline: scroll(x);               /* horizontal of nearest */

/* view(<axis>? <inset>?) */
animation-timeline: view();
animation-timeline: view(block);
animation-timeline: view(inline 200px);      /* start inset */
animation-timeline: view(block 10% 20%);     /* start, end insets */
```

## Parallax with view()

```css
.parallax-bg {
  animation: parallax linear;
  animation-timeline: view();
  animation-range: cover;
}
@keyframes parallax {
  from { transform: translateY(-20%); }
  to   { transform: translateY(20%); }
}
```

## Pin-style sticky reveal

Native CSS can't pin, but combine with `position: sticky` for similar effects:

```css
.sticky-headline { position: sticky; top: 20vh; }
.sticky-headline {
  animation: zoom linear;
  animation-timeline: view();
  animation-range: contain 0% contain 100%;
}
@keyframes zoom {
  0%   { transform: scale(1); }
  100% { transform: scale(2.5); }
}
```

For true pin-with-multi-step sequences, fall back to GSAP ScrollTrigger.

## Fallback pattern (mandatory until Firefox ships)

Browsers without scroll-timeline ignore the property — your animation either won't run or will run on time. Guard with `@supports`:

```css
.card { opacity: 0; transform: translateY(60px); }

@supports (animation-timeline: view()) {
  .card {
    animation: rise linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 40%;
  }
}

/* JS fallback for unsupported browsers */
@supports not (animation-timeline: view()) {
  /* leave opacity:0 baseline; JS adds .in-view class */
}
```

Or load a polyfill: `scroll-timeline-polyfill` from the Chrome team (heavy ~80KB — usually not worth it).

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

For `view-timeline` reveals specifically, this is critical because the user *will* trigger them constantly by scrolling.

## Browser support snapshot (2026)

| Browser   | scroll-timeline | view-timeline | Notes                           |
| --------- | --------------- | ------------- | ------------------------------- |
| Chrome    | ✅ 115+         | ✅ 115+        | Full support                    |
| Edge      | ✅ 115+         | ✅ 115+        | Full support                    |
| Safari    | ✅ 18+          | ✅ 18+         | Shipped late 2024               |
| Firefox   | ⚠️  behind flag | ⚠️  behind flag | `layout.css.scroll-driven-animations.enabled` |

Always design content to be readable without animations.

## When to use this vs JS libraries

| Use **CSS scroll-driven** when                 | Use **GSAP / Motion** when                  |
| ---------------------------------------------- | ------------------------------------------- |
| Simple linear progress / reveal / parallax     | Multi-element timelines, complex sequencing |
| You can tolerate Firefox graceful degradation  | You must support all browsers identically   |
| You want zero JS bundle cost                   | You're already using GSAP elsewhere         |
| Animation can be expressed in linear keyframes | You need pin, snap, batch, scrub-with-ease  |

## Anti-patterns

- Animating `top`/`left`/`width` instead of `transform`/`opacity` → triggers layout each frame.
- No `@supports` fallback + element starts at `opacity: 0` → content invisible in Firefox.
- `animation-timeline: scroll()` on an element that isn't in a scrollable ancestor → silently no-ops.
- Using both `animation-duration` and `animation-timeline` → `duration` is overridden, gets ignored.
- Forgetting `animation-fill-mode: both` (or `both` shorthand) → start/end states don't stick.

## Related skills

- `scroll-animations` — for the JS reveal pattern that works everywhere
- `parallax-effects` — for the perspective-trick CSS-only parallax
- `gsap-scrolltrigger` — for cases where native CSS isn't enough
- `scroll-performance-a11y` — for the cross-cutting performance + a11y rules
