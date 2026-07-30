import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { Link000, Link003 } from '@/components/ui/skiper-ui/skiper40'

function sectionHref(id: string, pathname: string) {
  return pathname === '/' ? `#${id}` : `/#${id}`
}

export function SiteFooter() {
  const location = useLocation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-black/[0.04] py-14">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="neu-raised grid gap-10 rounded-[24px] p-8 md:grid-cols-3 md:p-10">
          <div>
            <Link
              to="/"
              className="mb-3 inline-flex items-center gap-2 font-display text-lg font-bold text-ink no-underline hover:no-underline"
            >
              <img
                src="/assets/sportiv_logo.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              Sportiv
            </Link>
            <p className="m-0 text-ink-muted">
              Pakistan sports matching for real 2-player games.
            </p>
            <p className="mt-2">
              <Link000 href="mailto:support@sportiv.app">
                support@sportiv.app
              </Link000>
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold tracking-wide text-ink">
              Explore
            </h4>
            <ul className="m-0 list-none space-y-3 p-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <Link000 href={sectionHref(item.id, location.pathname)}>
                    {item.label}
                  </Link000>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-semibold tracking-wide text-ink">
              Legal
            </h4>
            <ul className="m-0 list-none space-y-3 p-0">
              <li>
                <Link003 href="/privacy">Privacy Policy</Link003>
              </li>
            </ul>
            <p className="mt-6 text-xs text-ink-muted/80">
              Link animations by{' '}
              <a
                href="https://skiper-ui.com"
                target="_blank"
                rel="noreferrer"
                className="text-ink-muted underline hover:text-court"
              >
                Skiper UI
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 text-sm text-ink-muted">
          <span>&copy; {year} Sportiv. All rights reserved.</span>
          <span>Coming Soon on Android</span>
        </div>
      </div>
    </footer>
  )
}
