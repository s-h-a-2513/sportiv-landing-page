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
    <div>
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

      <div className="mx-auto mb-6 flex w-full max-w-lg flex-wrap justify-center gap-3 sm:w-fit">
        {TABS.map((tab, index) => {
          const active = activeIndex === index
          return (
            <button
              key={tab.id}
              type="button"
              className={cn(
                'neu-tab min-w-[9.5rem] flex-1 rounded-pill px-5 py-2.5 text-sm font-semibold sm:flex-none',
                active && 'neu-tab-active',
              )}
              data-active={active ? 'true' : 'false'}
              aria-pressed={active}
              onClick={() => select(index)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="neu-inset rounded-[20px] px-5 py-5 md:px-6 md:py-6">
        <TransitionPanel
          activeIndex={activeIndex}
          className="min-h-[132px]"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          variants={{
            enter: { opacity: 0, y: 12, filter: 'blur(2px)' },
            center: { opacity: 1, y: 0, filter: 'blur(0px)' },
            exit: { opacity: 0, y: -10, filter: 'blur(2px)' },
          }}
        >
          {TABS.map((tab) => (
            <ul key={tab.id} className="m-0 list-none space-y-2.5 p-0">
              {tab.lines.map((line) => (
                <li key={line} className="body-copy">
                  {line}
                </li>
              ))}
            </ul>
          ))}
        </TransitionPanel>
      </div>
    </div>
  )
}
