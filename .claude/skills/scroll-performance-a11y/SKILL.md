---
name: scroll-performance-a11y
description: Use whenever working on scroll animations, parallax, or smooth-scroll — these are cross-cutting rules every scroll feature must follow. Covers: GPU compositor properties (transform/opacity only), `will-change` correct usage, `requestAnimationFrame` batching, passive scroll listeners, layout-thrashing avoidance, `prefers-reduced-motion` (the WCAG 2.3.3 requirement), `scroll-behavior: smooth` interactions, and mobile gotchas (background-attachment, 100vh). Treat this as the checklist for code review.
---

# Scroll Performance & Accessibility — The Non-Negotiables

Every scroll-related feature (parallax, reveal, smooth-scroll, scrollytelling) must pass this checklist. Apply during code review.

## The performance contract

Modern browsers run animations on **three threads**:

1. **Main thread** — JS, layout, paint
2. **Compositor thread** — composites GPU layers
3. **GPU** — actual pixel work

To stay at 60fps (one frame every 16.67ms), keep work off the main thread.

### Only animate these properties

| Property            | What it triggers   | Use it?                |
| ------------------- | ------------------ | ---------------------- |
| `transform`         | Composite only     | ✅ Always prefer       |
| `opacity`           | Composite only     | ✅ Always prefer       |
| `filter` (some)     | Composite (mostly) | ⚠️ OK in moderation    |
| `width` / `height`  | Layout + paint     | ❌ Use `scale()`       |
| `top` / `left`      | Layout + paint     | ❌ Use `translate()`   |
| `margin` / `padding`| Layout + paint     | ❌ Use `translate()`   |
| `background-position` | Paint            | ❌ Use `transform`     |
| `box-shadow`        | Paint              | ❌ Pre-compose or fade overlay |

**Rule:** if you must change layout, change it once on a state transition — never animate it.

## `will-change` — correct usage

`will-change: transform` promotes the element to its own GPU layer. This costs memory.

**Correct:**
```css
.card:hover { will-change: transform; }  /* hint right before the change */
```

```js
// Or: apply right before, remove after:
el.style.willChange = 'transform';
animate(el).then(() => el.style.willChange = 'auto');
```

**Wrong:**
```css
*               { will-change: transform; } /* memory disaster */
.every-element  { will-change: transform; } /* same */
```

If something already animates GPU-friendly properties (`transform`, `opacity`) constantly, you usually don't need `will-change` at all — the browser auto-promotes.

## `transform: translateZ(0)` / `translate3d(0,0,0)` hacks

Forces a compositor layer in older engines. In modern engines (Chrome 100+, Safari 17+) the browser is smart enough without it. Use only when you measure a problem.

## `requestAnimationFrame` batching

Never run computations inside a `scroll` listener directly — listeners can fire 100+ times per gesture. Coalesce with rAF:

```js
let latestY = window.scrollY;
let ticking = false;

window.addEventListener('scroll', () => {
  latestY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(() => {
      doStuff(latestY);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
```

**Better:** use `IntersectionObserver` for entry/exit, native `scroll-timeline` for progress, or a smooth-scroll lib like Lenis that already has a tuned rAF loop.

## Passive scroll listeners

```js
window.addEventListener('scroll', handler, { passive: true });
```

Without `passive: true`, the browser must wait to see if your handler calls `preventDefault()` before scrolling — that adds latency to every scroll. Modern Chrome defaults this to `true` for `wheel`/`touchstart`/`touchmove`/`scroll` on document/window, but explicitly setting it makes intent clear and prevents devtools warnings.

## Layout thrashing — the silent killer

This kills FPS:

```js
// BAD — read/write/read forces synchronous layout recalc each iteration
for (const el of elements) {
  const w = el.offsetWidth;       // READ (forces layout if dirty)
  el.style.width = w * 2 + 'px';  // WRITE (marks layout dirty)
}
```

Fix by batching reads then writes:

```js
const widths = elements.map((el) => el.offsetWidth);   // batch reads
elements.forEach((el, i) => el.style.width = widths[i] * 2 + 'px'); // batch writes
```

Inside a rAF callback, do all reads first, then all writes.

## `prefers-reduced-motion` — the WCAG requirement

This is **not optional**. Roughly **25% of macOS/iOS users** enable Reduce Motion. WCAG 2.3.3 (AAA) requires animation can be disabled. Some users get nausea/vertigo from parallax.

### CSS

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* Or be granular — replace heavy animations with fades: */
  .parallax { transform: none !important; }
  .reveal   { opacity: 1; transform: none; }
}
```

### JS

```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

function setup() {
  if (reduce.matches) return; // skip parallax entirely
  initParallax();
}

reduce.addEventListener('change', setup);
setup();
```

### GSAP

```js
gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  gsap.to('.hero', { y: -200, scrollTrigger: { scrub: 1 } });
});
```

### Lenis

```js
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = new Lenis({ lerp: reduce ? 1 : 0.1, smoothWheel: !reduce });
```

## `scroll-behavior: smooth` interactions

```css
html { scroll-behavior: smooth; }
```

Pros: instant smooth jumps on anchor links, zero JS.
Cons: **fights with Lenis / ScrollSmoother** — they hijack scroll and the native `smooth` setting interferes.

When using Lenis, **remove** `scroll-behavior: smooth` from `html`. Lenis handles it.

Also remove it inside `@media (prefers-reduced-motion: reduce)` (see above).

## Mobile gotchas

### `background-attachment: fixed` — broken on iOS Safari

Don't use it for parallax. Use a separate fixed `position: fixed` background, or use `transform`-based parallax.

### `100vh` shifts on mobile scroll

iOS Safari's address bar collapses on scroll, changing the viewport height. Animations measured in vh jump.

**Fix:** use `100svh` / `100dvh` (small / dynamic viewport height) for hero sections.

```css
.hero { min-height: 100svh; }       /* small VH — safest */
.fullscreen { min-height: 100dvh; } /* dynamic VH — grows/shrinks */
```

### Touch inertia overrides

Don't enable `syncTouch: true` in Lenis for general audiences. Mobile users expect native momentum.

### Reduced motion is set per-OS

iOS path: Settings → Accessibility → Motion → Reduce Motion. macOS path: System Settings → Accessibility → Display → Reduce Motion. Test both states.

## Memory and cleanup

Long pages with hundreds of animated elements need cleanup:

```js
// IO: unobserve once-played reveals
io.unobserve(el);

// Or fully tear down when component unmounts
io.disconnect();

// GSAP: kill timelines / ScrollTriggers
tl.kill();
ScrollTrigger.getAll().forEach((st) => st.kill());

// Lenis: destroy on SPA navigation
lenis.destroy();
```

In React, use `useGSAP` (auto-cleanup) and IO cleanup in `useEffect` return.

## Measurement — verify, don't guess

1. **Chrome DevTools → Performance** → record while scrolling. Look for:
   - Frames bar should stay green (16.67ms or less per frame)
   - No "Layout" or "Recalculate Style" blocks during scroll
2. **Chrome DevTools → Rendering**:
   - Enable "Paint flashing" — animated areas should NOT flash (means they're on the compositor)
   - Enable "Layer borders" — confirms compositor layers
3. **Lighthouse** — check "Avoids large layout shifts" and "Minimizes main-thread work"

## Code review checklist

When reviewing scroll-animation PRs, confirm:

- [ ] Only `transform` and `opacity` are animated
- [ ] No `scroll` listener without `requestAnimationFrame` batching or `IntersectionObserver`
- [ ] `{ passive: true }` on any explicit scroll/touch listeners
- [ ] `prefers-reduced-motion: reduce` is honored (CSS or JS)
- [ ] `will-change` is targeted, not global
- [ ] No `background-attachment: fixed` on mobile-targeted pages
- [ ] `100svh`/`100dvh` used for full-viewport sections
- [ ] IntersectionObservers `unobserve` once-played elements
- [ ] GSAP timelines clean up on unmount (`useGSAP` or `tl.kill()`)
- [ ] If using Lenis: `scroll-behavior: smooth` removed from `html`
- [ ] If using ScrollTrigger: `ScrollTrigger.refresh()` after fonts/images load
- [ ] No layout thrashing (read-then-write batching where DOM is measured)

## Related skills

- `parallax-effects` — implementations that obey these rules
- `scroll-animations` — reveal patterns built on IO
- `smooth-scroll-lenis` — smooth-scroll setup respecting reduced motion
- `gsap-scrolltrigger` — GSAP-specific cleanup and refresh
- `css-scroll-driven` — native CSS, lightest performance footprint
