"use client";

import { useEffect, useRef } from "react";

const DURATION_MS = 450;
const STEP_MS = 55;
const MAX_STEPS = 5; // cap the stagger so a 60-card batch never waits 3s
const RISE_PX = 12;

interface RevealGridProps {
  className?: string;
  /** Change this when the children are replaced (filter, search, category)
   *  so the new set animates in too. Leave undefined for static lists. */
  resetKey?: string | number;
  children: React.ReactNode;
}

/**
 * Wraps a card grid and fades its items in as they scroll into view.
 *
 * Deliberately blank-proof:
 *   - The server renders every card fully visible. Nothing here runs at SSR,
 *     so a slow, failed or disabled JS bundle leaves a normal, readable page.
 *   - On mount we only hide the cards that are *already below the fold*.
 *     Anything on screen at load stays on screen — that's what prevents the
 *     "page looks empty until I scroll" behaviour on tall desktop viewports
 *     and on short mobile ones where the whole grid fits above the fold.
 *   - The motion is opacity + a 12px rise. No horizontal movement, so cards
 *     never slide in from the sides.
 *   - prefers-reduced-motion turns the whole thing off.
 *
 * It styles the real grid children directly instead of wrapping each one in a
 * div, so grid/flex layout and equal-height rows are untouched.
 */
export function RevealGrid({ className, resetKey, children }: RevealGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(root.children) as HTMLElement[];
    const pending = items.filter(
      (el) => el.getBoundingClientRect().top >= window.innerHeight
    );
    if (pending.length === 0) return;

    const timers: number[] = [];

    const hide = (el: HTMLElement) => {
      el.style.opacity = "0";
      el.style.transform = `translateY(${RISE_PX}px)`;
      el.style.willChange = "opacity, transform";
    };

    // Hand the element back to its own stylesheet once it has arrived, so the
    // card's `transition hover:-translate-y-0.5` works normally again.
    const release = (el: HTMLElement) => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
      el.style.willChange = "";
    };

    pending.forEach(hide);

    const observer = new IntersectionObserver(
      (entries) => {
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Math.min(step, MAX_STEPS) * STEP_MS;
          step += 1;

          el.style.transition = `opacity ${DURATION_MS}ms ease-out ${delay}ms, transform ${DURATION_MS}ms ease-out ${delay}ms`;
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          timers.push(
            window.setTimeout(() => release(el), DURATION_MS + delay + 50)
          );
          observer.unobserve(el);
        }
      },
      // Fire a little before the card's top edge reaches the bottom of the
      // viewport, so it is done animating by the time it is properly in view.
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
    );

    pending.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
      pending.forEach(release);
    };
  }, [resetKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
