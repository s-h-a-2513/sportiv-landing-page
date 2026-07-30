import { useLocation } from 'react-router-dom'
import { BrandMark } from '@/components/BrandMark'
import { NAV_ITEMS } from '@/lib/nav'
import { Link000, Link003 } from '@/components/ui/skiper-ui/skiper40'

function sectionHref(id: string, pathname: string) {
  return pathname === '/' ? `#${id}` : `/#${id}`
}

export function SiteFooter() {
  const location = useLocation()
  const year = new Date().getFullYear()

  return (
    <footer className="pb-8 pt-4 md:pb-10 md:pt-6">
      <div className="mx-auto max-w-content px-6 md:px-10">
        <div className="neu-raised grid gap-8 rounded-[28px] p-6 md:grid-cols-3 md:gap-6 md:p-8">
          <div>
            <BrandMark size="sm" className="mb-3" />
            <p className="body-copy m-0 text-[0.95rem]">
              Pakistan sports matching for real 2-player games.
            </p>
            <p className="mt-2">
              <Link000 href="mailto:support@sportiv.app">
                support@sportiv.app
              </Link000>
            </p>
          </div>

          <div>
            <h4 className="mb-2.5 font-display text-sm font-bold tracking-wide text-ink">
              Explore
            </h4>
            <ul className="m-0 list-none space-y-2 p-0">
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
            <h4 className="mb-2.5 font-display text-sm font-bold tracking-wide text-ink">
              Legal
            </h4>
            <ul className="m-0 list-none space-y-2 p-0">
              <li>
                <Link003 href="/privacy">Privacy Policy</Link003>
              </li>
            </ul>
            <p className="mt-5 text-xs font-medium text-ink-muted">
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

        <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm font-medium text-ink-muted">
          <span>&copy; {year} Sportiv. All rights reserved.</span>
          <span>Coming Soon on Android</span>
        </div>
      </div>
    </footer>
  )
}
