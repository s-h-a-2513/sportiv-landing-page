import { lazy, Suspense, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatedBackground } from '@/components/core/animated-background'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'
import { useScrollSpy } from '@/hooks/useScrollSpy'

const WaitlistDialog = lazy(() =>
  import('@/components/WaitlistDialog').then((m) => ({
    default: m.WaitlistDialog,
  })),
)

function sectionHref(id: string, pathname: string) {
  return pathname === '/' ? `#${id}` : `/#${id}`
}

const waitlistBtnClass =
  'neu-btn inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-sm font-semibold text-white hover:text-white hover:no-underline'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const activeId = useScrollSpy()
  const onHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-[100] pt-3.5">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="neu-header relative flex min-h-[58px] items-center justify-between gap-4 rounded-pill px-4 py-2 pl-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 font-display text-[1.2rem] font-bold tracking-tight text-ink no-underline hover:no-underline"
          >
            <img
              src="/assets/sportiv_logo.png"
              alt=""
              width={34}
              height={34}
              className="h-[34px] w-[34px] object-contain"
            />
            Sportiv
          </Link>

          <button
            type="button"
            className="neu-raised flex h-[42px] w-[42px] items-center justify-center rounded-full border-0 p-0 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-0.5 w-4 bg-court before:absolute before:left-0 before:top-[-5px] before:block before:h-0.5 before:w-4 before:bg-court after:absolute after:left-0 after:top-[5px] after:block after:h-0.5 after:w-4 after:bg-court" />
          </button>

          <nav
            className="hidden flex-1 items-center justify-center lg:flex"
            aria-label="Primary"
          >
            <div className="flex flex-row">
              <AnimatedBackground
                enableHover
                className="rounded-lg bg-court-soft"
                transition={{
                  type: 'spring',
                  bounce: 0.2,
                  duration: 0.3,
                }}
              >
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={sectionHref(item.id, location.pathname)}
                    data-id={item.id}
                    className={cn(
                      'px-3.5 py-2 text-[0.95rem] font-medium text-ink-muted transition-colors duration-300 hover:text-ink hover:no-underline',
                      onHome &&
                        activeId === item.id &&
                        'font-semibold text-court',
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </AnimatedBackground>
            </div>
          </nav>

          <div className="hidden lg:block">
            <Suspense
              fallback={
                <span
                  className={waitlistBtnClass}
                  aria-hidden
                  style={{ minWidth: 120, minHeight: 40 }}
                />
              }
            >
              <WaitlistDialog
                triggerLabel="Join waitlist"
                triggerClassName={waitlistBtnClass}
              />
            </Suspense>
          </div>

          {open && (
            <nav
              className="neu-raised absolute left-0 right-0 top-[calc(100%+10px)] z-50 flex flex-col gap-0.5 rounded-[20px] p-3 lg:hidden"
              aria-label="Primary"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={sectionHref(item.id, location.pathname)}
                  className={cn(
                    'rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-ink-muted no-underline hover:bg-court-soft hover:text-ink hover:no-underline',
                    onHome &&
                      activeId === item.id &&
                      'bg-court-soft font-semibold text-court',
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-1">
                <Suspense
                  fallback={
                    <span
                      className={cn(waitlistBtnClass, 'w-full')}
                      aria-hidden
                      style={{ minHeight: 40 }}
                    />
                  }
                >
                  <WaitlistDialog
                    triggerLabel="Join waitlist"
                    triggerClassName={cn(waitlistBtnClass, 'w-full')}
                    onOpen={() => setOpen(false)}
                  />
                </Suspense>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
