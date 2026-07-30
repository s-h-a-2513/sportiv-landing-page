import { lazy, Suspense, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatedBackground } from '@/components/core/animated-background'
import { BrandMark } from '@/components/BrandMark'
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
    <header className="sticky top-0 z-[100] pt-3">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="neu-header relative grid min-h-[56px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-pill px-3 py-2 sm:px-4">
          <BrandMark size="md" />

          <nav
            className="hidden items-center justify-center lg:flex"
            aria-label="Primary"
          >
            <div className="neu-inset flex rounded-pill p-1">
              <AnimatedBackground
                enableHover
                className="rounded-pill bg-court-soft"
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
                      'px-3.5 py-2 text-sm font-semibold text-ink-muted transition-colors duration-300 hover:text-ink hover:no-underline',
                      onHome &&
                        activeId === item.id &&
                        'font-bold text-court',
                    )}
                  >
                    {item.label}
                  </a>
                ))}
              </AnimatedBackground>
            </div>
          </nav>

          <div className="flex items-center justify-end gap-2">
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

            <button
              type="button"
              className="neu-raised-sm flex h-10 w-10 items-center justify-center rounded-full border-0 p-0 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-0.5 w-4 bg-court before:absolute before:left-0 before:top-[-5px] before:block before:h-0.5 before:w-4 before:bg-court after:absolute after:left-0 after:top-[5px] after:block after:h-0.5 after:w-4 after:bg-court" />
            </button>
          </div>

          {open && (
            <nav
              className="neu-raised absolute left-0 right-0 top-[calc(100%+10px)] z-50 col-span-3 flex flex-col gap-0.5 rounded-[20px] p-3 lg:hidden"
              aria-label="Primary"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={sectionHref(item.id, location.pathname)}
                  className={cn(
                    'rounded-xl px-3.5 py-3 text-[0.95rem] font-semibold text-ink-muted no-underline hover:bg-court-soft hover:text-ink hover:no-underline',
                    onHome &&
                      activeId === item.id &&
                      'bg-court-soft font-bold text-court',
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
