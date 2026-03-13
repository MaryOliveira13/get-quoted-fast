import { useEffect, useRef, useCallback } from "react";

/**
 * Applies intersection-observer-based reveal/hide animations
 * to children of a scrollable container marked with data-reveal-item.
 */
export function useScrollReveal(isActive: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;
    const container = scrollRef.current;
    if (!container) return;

    let observer: IntersectionObserver;

    const raf = requestAnimationFrame(() => {
      const items = container.querySelectorAll<HTMLElement>("[data-reveal-item]");

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              el.classList.add("reveal-visible");
              el.classList.remove("reveal-hidden");
            } else {
              el.classList.remove("reveal-visible");
              el.classList.add("reveal-hidden");
            }
          });
        },
        { root: container, rootMargin: "0px", threshold: 0.15 }
      );

      items.forEach((item) => observer.observe(item));
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [isActive]);

  return scrollRef;
}
