# Scroll & Parallax Skills

Six focused skills covering modern parallax effects and scroll animations. Each `SKILL.md` is auto-discoverable by Claude Code via its frontmatter `description`.

| Skill                    | When to use                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `parallax-effects`       | Multi-layer parallax, depth scrolling, mouse-tilt, Ken Burns      |
| `scroll-animations`      | Reveal-on-scroll (fade-up, stagger, counter, text splits)         |
| `smooth-scroll-lenis`    | Buttery momentum scrolling with Lenis (vanilla + React + GSAP)    |
| `gsap-scrolltrigger`     | Pin, scrub, horizontal scroll, scrollytelling sequences           |
| `css-scroll-driven`      | Native CSS `scroll-timeline` / `view-timeline` (zero JS)          |
| `scroll-performance-a11y`| Cross-cutting performance + accessibility checklist (always apply)|

## Decision flow

```
Need to animate based on scroll?
│
├── Just a one-shot reveal as it enters view?
│   └── scroll-animations  (IntersectionObserver pattern)
│
├── Linked to scroll progress (parallax, progress bar)?
│   ├── Modern browsers only?  → css-scroll-driven
│   ├── Complex sequencing?    → gsap-scrolltrigger
│   └── Simple, all browsers?  → parallax-effects (rAF + transform)
│
├── Need momentum/smooth-scroll feel?
│   └── smooth-scroll-lenis  (pair with gsap-scrolltrigger if both)
│
└── Pin a section + multi-step sequence (scrollytelling)?
    └── gsap-scrolltrigger
```

Always cross-check against `scroll-performance-a11y` before shipping.
