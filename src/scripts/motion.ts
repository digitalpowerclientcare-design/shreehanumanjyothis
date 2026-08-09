/**
 * Client-side motion layer.
 *
 * Budget-conscious by design: Lenis (~3KB) + Motion One (~4KB used) are the
 * only libraries, and everything else is a handful of pointer/observer
 * listeners. The heavy lifting — reveals, aurora, starfield, meteors, the
 * zodiac wheel — is native CSS and ships zero bytes of JS.
 *
 * Every effect is skipped entirely under prefers-reduced-motion.
 */

import Lenis from 'lenis';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------- */
/*  1. Smooth scroll                                                          */
/* -------------------------------------------------------------------------- */

if (!reduced) {
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // In-page anchors need to go through Lenis or they jump.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -100 });
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  2. Cursor-follow spotlight                                                */
/*     Feeds two CSS custom properties; the gradient itself lives in CSS.     */
/* -------------------------------------------------------------------------- */

const spotlights = document.querySelectorAll<HTMLElement>('.spotlight');
if (spotlights.length && window.matchMedia('(hover: hover)').matches) {
  spotlights.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* -------------------------------------------------------------------------- */
/*  3. Pointer tilt                                                           */
/* -------------------------------------------------------------------------- */

const tilts = document.querySelectorAll<HTMLElement>('[data-tilt]');
if (tilts.length && !reduced && window.matchMedia('(hover: hover)').matches) {
  tilts.forEach((el) => {
    const max = Number(el.dataset.tilt) || 8;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `perspective(1100px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
    });

    el.addEventListener('pointerleave', () => {
      el.style.transform = 'perspective(1100px) rotateY(0) rotateX(0)';
    });
  });
}

/* Grid cascades are handled entirely in CSS (`.stagger` in global.css) using
   per-child `animation-range` offsets on a view() timeline. Doing it there
   rather than here means content is never parked at opacity:0 waiting on a
   script that might fail. */

/* -------------------------------------------------------------------------- */
/*  4. Count-up statistics                                                    */
/* -------------------------------------------------------------------------- */

/* Hand-rolled rather than pulling in an animation library. Motion One would
   have cost ~18KB gzipped to animate two integers; this is 20 lines and does
   the same easing. */
const counters = document.querySelectorAll<HTMLElement>('[data-count]');

if (counters.length) {
  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.countSuffix ?? '';
    if (Number.isNaN(target)) return;

    const DURATION = 1500;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      el.textContent = `${Math.round(easeOutExpo(t) * target)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        observer.unobserve(e.target);
        run(e.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );

  counters.forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.countSuffix ?? '';
    // Reduced motion (and the no-JS case) keeps the final value in the markup.
    if (reduced || Number.isNaN(target)) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    el.textContent = `0${suffix}`;
    observer.observe(el);
  });
}

/* -------------------------------------------------------------------------- */
/*  6. Header state on scroll                                                 */
/* -------------------------------------------------------------------------- */

const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

export {};
