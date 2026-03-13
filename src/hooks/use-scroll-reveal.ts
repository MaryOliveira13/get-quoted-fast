import { useEffect, useRef, useCallback } from "react";

/**
 * Applies intersection-observer-based reveal/hide animations
 * to children of a scrollable container.
 */
export function useScrollReveal(isActive: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const observe = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>("[data-reveal-item]");

    const observer = new IntersectionObserver(
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

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    // Small delay so DOM is painted
    const raf = requestAnimationFrame(() => {
      const cleanup = observe();
      return cleanup;
    });
    return () => cancelAnimationFrame(raf);
  }, [isActive, observe]);

  return scrollRef;
}
