import { useEffect, useRef } from 'react'
import type { Scope } from 'animejs'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function showMotionTargets(root: HTMLElement | null) {
  root
    ?.querySelectorAll('.hero-anim, .hero-phone, .anime-reveal')
    .forEach((el) => {
      ;(el as HTMLElement).style.opacity = '1'
    })
}

/**
 * Anime.js React scope — see https://animejs.com/documentation/getting-started/using-with-react
 * Anime is loaded asynchronously so it stays out of the initial JS chunk.
 */
export function useAnimeScope(
  setup: (scope: Scope, anime: typeof import('animejs')) => void,
  deps: unknown[] = [],
) {
  const root = useRef<HTMLDivElement | null>(null)
  const scopeRef = useRef<Scope | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!root.current || prefersReducedMotion()) {
      showMotionTargets(root.current)
      return
    }

    void import('animejs').then((anime) => {
      if (cancelled || !root.current) return

      const scope = anime.createScope({ root }).add((self) => {
        if (self) setup(self, anime)
      })
      scopeRef.current = scope
    })

    return () => {
      cancelled = true
      scopeRef.current?.revert()
      scopeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { root, scope: scopeRef }
}

export function usePageMotion() {
  return useAnimeScope((self, { animate, onScroll, spring }) => {
    animate('.hero-anim', {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: (_el: unknown, i = 0) => i * 80,
      duration: 700,
      ease: 'out(3)',
    })

    animate('.hero-phone', {
      opacity: [0, 1],
      translateY: [36, 0],
      scale: [0.96, 1],
      duration: 900,
      delay: 200,
      ease: 'out(3)',
      onComplete: () => {
        animate('.hero-phone', {
          translateY: [
            { to: -10, ease: 'inOut(2)', duration: 1800 },
            { to: 0, ease: spring({ bounce: 0.35 }) },
          ],
          loop: true,
          loopDelay: 400,
        })
      },
    })

    document.querySelectorAll('.anime-reveal').forEach((el) => {
      animate(el, {
        opacity: [0, 1],
        translateY: [28, 0],
        duration: 650,
        ease: 'out(3)',
        autoplay: onScroll({
          target: el as HTMLElement,
          sync: 0.15,
        }),
      })
    })

    self.add('press', (selector: string) => {
      animate(selector, {
        scale: [
          { to: 0.97, duration: 80 },
          { to: 1, ease: spring({ bounce: 0.4 }), duration: 280 },
        ],
      })
    })
  })
}
