---
name: parallax-effects
description: Use when implementing parallax effects — background-image parallax, multi-layer depth scrolling, mouse-driven 3D tilt, image zoom-on-scroll, or "ken burns" cinematic motion. Covers CSS-only (perspective trick, background-attachment), modern JS (transform + rAF), Intersection Observer, scroll-driven CSS, GSAP/Lenis recipes, and decision tree for picking the right technique. Avoids janky scroll-listener anti-patterns.
---

# Parallax Effects — Professional Playbook

A parallax effect creates depth illusion by moving layers at different speeds relative to the scroll (or pointer) position. The goal is always the same: animate `transform` on the compositor thread, never properties that trigger layout/paint.

## Decision tree — pick the right technique

| Need                                                       | Technique                                       |
| ---------------------------------------------------------- | ----------------------------------------------- |
| Static hero background that moves slower than foreground   | Pure CSS `perspective` + `translateZ` parallax  |
| Modern browsers only, no JS                                | CSS `animation-timeline: view()` (see `css-scroll-driven` skill) |
| One-off image zoom/translate as section enters viewport    | Intersection Observer + CSS class toggle        |
| Complex multi-layer parallax with horizontal/pin sequences | GSAP ScrollTrigger (`gsap-scrolltrigger` skill) |
| Buttery smooth feel across the whole page                  | Lenis smooth scroll + transform handlers        |
| Mouse cursor 3D tilt on a card                             | `requestAnimationFrame` + `rotate3d` (recipe below) |

## Hard rules

1. **Animate only `transform` and `opacity`.** Anything else (`top`, `background-position`, `margin`) triggers layout/paint and kills 60fps.
2. **Never attach work to `scroll` listeners directly.** Use `requestAnimationFrame` to batch, or use `IntersectionObserver`, or use a smooth-scroll loop, or use native CSS scroll timelines.
3. **Always add `{ passive: true }`** if you must use a `scroll` listener — otherwise the browser pauses scrolling to wait for your handler.
4. **Use `will-change: transform` sparingly** — only on elements you're actively animating, and remove it after. Permanent `will-change` wastes GPU memory.
5. **Honor `prefers-reduced-motion: reduce`** — disable or shrink parallax motion. ~25% of macOS/iOS users have it on.
6. **Avoid `background-attachment: fixed`** on mobile (broken in iOS Safari) and on big background images (causes paints).

## Recipe 1 — Pure CSS parallax (zero JS, zero libraries)

The "perspective trick" uses 3D transforms to make the browser render layers at different depths. Scrolling moves them at proportional speeds for free.

```html
<div class="parallax">
  <section class="parallax__layer parallax__layer--back">
    <img src="mountains.jpg" alt="" />
  </section>
  <section class="parallax__layer parallax__layer--base">
    <h1>Suíça</h1>
  </section>
</div>
```

```css
.parallax {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  perspective: 8px;
  perspective-origin: 0 0;
}
.parallax__layer { position: absolute; inset: 0; }
.parallax__layer--back  { transform: translateZ(-8px) scale(2); }   /* moves slower */
.parallax__layer--base  { transform: translateZ(0); }
```

Pros: no JS, GPU-accelerated, runs on the compositor.
Cons: scrollbar is on `.parallax` (not `body`); doesn't play well with `position: fixed` overlays.

## Recipe 2 — Modern parallax (transform + rAF, vanilla JS)

The "compositor-friendly" pattern. Read scroll position once per frame, write transforms in batch.

```js
const layers = document.querySelectorAll('[data-parallax-speed]');
let latestY = window.scrollY;
let ticking = false;

function update() {
  for (const el of layers) {
    const speed = parseFloat(el.dataset.parallaxSpeed); // e.g. 0.3 = slower
    el.style.transform = `translate3d(0, ${latestY * speed}px, 0)`;
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  latestY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(update);
    ticking = true;
  }
}, { passive: true });
```

```html
<img data-parallax-speed="-0.25" src="bg.jpg" alt="" />
<div data-parallax-speed="-0.1">Headline</div>
```

Negative speeds move the element opposite to scroll (the classic parallax illusion).

## Recipe 3 — Reveal-on-scroll image zoom (Intersection Observer)

Use this when each section has its own one-shot effect — IO is cheap because it doesn't fire continuously.

```js
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target); // play once
    }
  }
}, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.zoom-in').forEach((el) => io.observe(el));
```

```css
.zoom-in img { transform: scale(1.2); transition: transform 1.4s cubic-bezier(.2,.6,.2,1); }
.zoom-in.in-view img { transform: scale(1); }
```

## Recipe 4 — Mouse cursor 3D tilt (works for cards, hero images)

```js
function attachTilt(el, max = 12) {
  let rect;
  const onEnter = () => { rect = el.getBoundingClientRect(); };
  const onMove = (e) => {
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
  };
  const onLeave = () => { el.style.transform = ''; };
  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
}
document.querySelectorAll('.tilt').forEach((el) => attachTilt(el));
```

Add `transform-style: preserve-3d` on the parent and `translateZ()` on children to make inner elements lift toward the camera.

## Recipe 5 — Ken Burns / cinematic drift (CSS-only, infinite loop)

Great for hero backgrounds that should feel "alive" without scroll.

```css
@keyframes kenburns {
  0%   { transform: scale(1)    translate(0, 0); }
  50%  { transform: scale(1.12) translate(-2%, -1%); }
  100% { transform: scale(1)    translate(0, 0); }
}
.hero img { animation: kenburns 20s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .hero img { animation: none; }
}
```

## Recipe 6 — Multi-layer parallax with depth keys (data-driven)

For complex scenes (mountain ranges, foreground/midground/background trees, etc.):

```html
<section class="scene">
  <img data-depth="0.1" src="sky.jpg" />
  <img data-depth="0.3" src="mountains-far.png" />
  <img data-depth="0.6" src="mountains-near.png" />
  <img data-depth="0.9" src="trees.png" />
</section>
```

Combine Recipe 2's rAF loop with `data-depth` (higher = moves more = closer to camera).

## When in doubt: framework matrix

| Project type            | Recommended stack                                     |
| ----------------------- | ----------------------------------------------------- |
| Static HTML landing     | Vanilla rAF + Intersection Observer + CSS keyframes   |
| Heavy scrollytelling    | GSAP ScrollTrigger + Lenis                            |
| React/Next app          | Motion (`useScroll` + `useTransform`) or GSAP+Lenis   |
| Modern browsers only    | Native `scroll-timeline` / `view-timeline`            |
| WebGL/canvas needed     | Three.js + Lenis, shader-side parallax in vertex stage|

## Common mistakes to flag in code review

- `transform: translate3d(0, scrollY * speed, 0)` computed inside a `scroll` listener with no rAF → reads/writes per scroll tick, fights the browser.
- `background-attachment: fixed` on mobile → broken or jank.
- `will-change: transform` on every section → memory hog, can downgrade performance.
- Animating `top`/`left` instead of `transform` → triggers layout each frame.
- No `prefers-reduced-motion` guard → accessibility regression.
- `position: fixed` parallax layer inside an `overflow: hidden` ancestor → mysteriously breaks.

## Related skills

- `scroll-animations` — for one-shot reveal/trigger effects
- `smooth-scroll-lenis` — for buttery momentum scrolling
- `gsap-scrolltrigger` — for advanced timelines, pinning, scrub
- `css-scroll-driven` — for native scroll-timeline / view-timeline
- `scroll-performance-a11y` — for the cross-cutting performance + a11y rules
