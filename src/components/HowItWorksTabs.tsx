import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { TransitionPanel } from '@/components/core/transition-panel'
import { cn } from '@/lib/utils'

const TABS = [
  {
    id: 'players',
    label: 'For Players',
    lines: [
      'Discover nearby players by sport and distance.',
      'Match when likes are mutual, then chat.',
      'Propose a venue, date, and time.',
      'Report, block, and optional women-only visibility.',
    ],
  },
  {
    id: 'facilities',
    label: 'For Facility Owners',
    lines: [
      'Players find partners first, then pick local courts.',
      'Partner venues get visibility when matches propose games.',
      'Booking and listings are planned after matchmaking scales.',
    ],
  },
] as const

function indexFromHash(hash: string) {
  if (hash === '#facilities') return 1
  if (hash === '#players') return 0
  return 0
}

export function HowItWorksTabs() {
  const location = useLocation()
  const [activeIndex, setActiveIndex] = useState(() =>
    indexFromHash(location.hash),
  )

  useEffect(() => {
    if (location.hash === '#players' || location.hash === '#facilities') {
      setActiveIndex(indexFromHash(location.hash))
    }
  }, [location.hash])

  const select = (index: number) => {
    setActiveIndex(index)
    const id = TABS[index].id
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="anime-reveal">
      <div
        id="players"
        className="pointer-events-none absolute -top-24"
        aria-hidden
      />
      <div
        id="facilities"
        className="pointer-events-none absolute -top-24"
        aria-hidden
      />

      <div className="neu-inset mx-auto mb-10 flex w-fit flex-wrap justify-center gap-1 rounded-pill p-1.5">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            className={cn(
              'neu-tab rounded-pill px-5 py-2.5 text-sm font-medium',
              activeIndex === index && 'neu-tab',
            )}
            data-active={activeIndex === index ? 'true' : 'false'}
            onClick={() => select(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TransitionPanel
        activeIndex={activeIndex}
        className="min-h-[160px]"
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        variants={{
          enter: { opacity: 0, y: 16, filter: 'blur(2px)' },
          center: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: -12, filter: 'blur(2px)' },
        }}
      >
        {TABS.map((tab) => (
          <ul key={tab.id} className="m-0 list-none space-y-3 p-0">
            {tab.lines.map((line) => (
              <li
                key={line}
                className="text-lg leading-snug text-ink-muted md:text-xl"
              >
                {line}
              </li>
            ))}
          </ul>
        ))}
      </TransitionPanel>
    </div>
  )
}
