---
name: scroll-animations
description: Use when adding scroll-triggered reveal animations (fade-up, slide-in, stagger, counter-up, text reveals) or scrollytelling sequences. Covers IntersectionObserver-based reveals, AOS-style data-attribute patterns, staggered grids, scroll progress bars, text/word/letter splits, and when to reach for a library vs. write 30 lines of vanilla. Optimized for performance and accessibility.
---

# Scroll Animations — Reveals, Triggers, Scrollytelling

Scroll animations fall into three buckets, each with its own optimal tool:

| Bucket                  | Description                                                       | Best tool                         |
| ----------------------- | ----------------------------------------------------------------- | --------------------------------- |
| **Reveal / trigger**    | Element animates *once* when it enters the viewport (fade-up, etc.) | IntersectionObserver + CSS class  |
| **Scroll-linked**       | Animation progress is *driven* by scroll position (parallax, progress bars) | `scroll-timeline` / GSAP scrub / Motion `useScroll` |
| **Scrollytelling**      | Pin a section, then play multi-step sequences as scroll advances  | GSAP ScrollTrigger with `pin: true` |

## The lightweight reveal pattern (vanilla, ~20 lines)

This replaces 90% of AOS/wow.js usage with zero dependencies.

```html
<div class="reveal" data-reveal="fade-up">…</div>
<div class="reveal" data-reveal="slide-left" data-reveal-delay="200">…</div>
```

```css
.reveal { opacity: 0; transition: opacity .8s ease, transform .8s cubic-bezier(.2,.6,.2,1); }
.reveal[data-reveal="fade-up"]    { transform: translateY(40px); }
.reveal[data-reveal="slide-left"] { transform: translateX(-60px); }
.reveal[data-reveal="zoom-in"]    { transform: scale(.92); }

.reveal.in-view { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

```js
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const delay = entry.target.dataset.revealDelay || 0;
    setTimeout(() => entry.target.classList.add('in-view'), +delay);
    io.unobserve(entry.target); // play once
  }
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```

**Why this works:**
- IO runs off the main thread, fires only on threshold crossings.
- CSS handles the animation on the compositor.
- Single shared observer → cheap for hundreds of elements.
- `unobserve` after first hit → no zombie callbacks.

## Stagger pattern (grid of cards, list items)

```js
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const children = entry.target.querySelectorAll('.reveal-item');
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      child.classList.add('in-view');
    });
    io.unobserve(entry.target);
  }
}, { threshold: 0.2 });

document.querySelectorAll('.reveal-stagger').forEach((el) => io.observe(el));
```

For a "wave" feel use `cubic-bezier(.2,.6,.2,1)` with 60–120ms between items. More than 150ms feels sluggish.

## Two-way reveal (animate in *and* out)

Drop the `unobserve` and toggle the class:

```js
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  }
}, { threshold: 0.15 });
```

Use sparingly — bidirectional reveals can feel "twitchy" if the user scrolls back and forth.

## Counter / number tick on view

```js
function animateCount(el, to, dur = 1400) {
  const start = performance.now();
  function frame(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(to * eased).toLocaleString();
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const to = +entry.target.dataset.count;
    animateCount(entry.target, to);
    io.unobserve(entry.target);
  }
});
document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));
```

## Scroll progress bar (native CSS, no JS)

```css
.progress {
  position: fixed; inset: 0 0 auto 0; height: 3px; transform-origin: 0 50%;
  background: var(--gold); transform: scaleX(0);
  animation: progress linear; animation-timeline: scroll(root);
}
@keyframes progress { to { transform: scaleX(1); } }
```

Falls back gracefully (no bar) in browsers without scroll-timeline. See `css-scroll-driven` skill for full coverage.

## Text reveals (word / letter split)

Split into spans first, then stagger.

```js
function splitWords(el) {
  el.innerHTML = el.textContent
    .split(/\s+/)
    .map((w) => `<span class="word"><span class="word__inner">${w}</span></span>`)
    .join(' ');
}
document.querySelectorAll('[data-split="words"]').forEach(splitWords);
```

```css
.word { display: inline-block; overflow: hidden; }
.word__inner { display: inline-block; transform: translateY(100%); transition: transform .8s cubic-bezier(.2,.6,.2,1); }
.in-view .word__inner { transform: translateY(0); }
.in-view .word:nth-child(n) .word__inner { transition-delay: calc(var(--i, 0) * 40ms); }
```

For typewriter / character-by-character: split by `[...word]` instead.

## When to reach for a library

| Symptom                                                | Library to consider           |
| ------------------------------------------------------ | ----------------------------- |
| You need pinning, scrub, or horizontal sections        | GSAP ScrollTrigger            |
| You're in React/Next and want declarative `motion.div` | Motion (`useScroll` + `useTransform`) |
| You want polished out-of-box reveals, accept ~14KB     | AOS (still solid in 2026)     |
| You need smooth momentum scrolling                     | Lenis                         |
| You want WebGL/shader effects                          | Three.js + Lenis              |

**Don't import AOS for 5 fade-up divs.** The vanilla pattern above is 20 lines and faster.

## Scrollytelling skeleton (GSAP)

Pin a section, then animate a sequence as the user scrolls through that pinned region. Full reference in the `gsap-scrolltrigger` skill.

```js
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.story',
    start: 'top top',
    end: '+=3000',     // ~3 viewport heights of scroll = story length
    pin: true,
    scrub: 1,          // smooth catch-up
    anticipatePin: 1,  // prevents pin "flash"
  },
});

tl.from('.story__chapter-1', { autoAlpha: 0, y: 40 })
  .from('.story__chapter-2', { autoAlpha: 0, y: 40 }, '+=0.4')
  .to('.story__image', { scale: 1.2, x: '-20%' }, 0);
```

## Anti-patterns to flag in review

- `window.addEventListener('scroll', () => reveal())` without rAF or IO → fires 100+ times per gesture.
- Adding the same `.fade-in` class to 200 elements with the same `transition-delay` → all flash at once.
- Reveal animations with no `prefers-reduced-motion` opt-out.
- One IntersectionObserver per element instead of one shared observer.
- Forgetting to `unobserve` once-only reveals → memory leak on long pages.
- Animating `display: none → block` (no animation possible — paint jumps).

## Related skills

- `parallax-effects` — for scroll-linked depth motion
- `gsap-scrolltrigger` — for pin/scrub/scrollytelling
- `css-scroll-driven` — for native CSS reveals
- `scroll-performance-a11y` — for performance + reduced-motion rules
