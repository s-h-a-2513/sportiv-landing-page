import { lazy, Suspense } from 'react'
import { Container } from '@/components/ui'
import { BrandMark } from '@/components/BrandMark'
import { Link000 } from '@/components/ui/skiper-ui/skiper40'
import { usePageMotion } from '@/hooks/useAnimeScope'
import {
  CONTACT_FORMSPREE_ID,
  SUPPORT_MAILTO,
  formspreeAction,
} from '@/lib/formspree'

const WaitlistDialog = lazy(() =>
  import('@/components/WaitlistDialog').then((m) => ({
    default: m.WaitlistDialog,
  })),
)

const HowItWorksTabs = lazy(() =>
  import('@/components/HowItWorksTabs').then((m) => ({
    default: m.HowItWorksTabs,
  })),
)

function LineList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 list-none space-y-2.5 p-0">
      {items.map((line) => (
        <li key={line} className="body-copy">
          {line}
        </li>
      ))}
    </ul>
  )
}

function WaitlistFallback({ className }: { className?: string }) {
  return (
    <span
      className={className}
      aria-hidden
      style={{ display: 'inline-block', minWidth: 160, minHeight: 48 }}
    />
  )
}

export function HomePage() {
  const { root } = usePageMotion()
  const contactAction = formspreeAction(CONTACT_FORMSPREE_ID)

  return (
    <div ref={root}>
      <main>
        <section id="top" className="scroll-mt-header pb-6 pt-6 md:pb-8 md:pt-8">
          <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="max-w-xl">
              <div className="hero-anim mb-4 opacity-0">
                <BrandMark size="lg" asLink={false} />
              </div>
              <h1 className="hero-anim mb-3 font-display text-[clamp(2.15rem,4.5vw,3.1rem)] font-bold leading-[1.12] tracking-tight text-ink opacity-0">
                Find your next game partner.
              </h1>
              <p className="hero-anim body-copy mb-2 max-w-[40ch] opacity-0">
                Match with nearby players for real 2-player games. Built for
                Pakistan. Not a dating app.
              </p>
              <p className="hero-anim mb-5 max-w-[46ch] text-[0.95rem] font-semibold leading-snug text-ink opacity-0">
                Padel, Tennis, Squash, Snooker &amp; Chess · Karachi, Lahore,
                Islamabad, Rawalpindi · Coming Soon on Android
              </p>
              <div className="hero-anim flex flex-wrap gap-3 opacity-0">
                <Suspense
                  fallback={
                    <WaitlistFallback className="neu-btn rounded-pill px-7 py-3.5" />
                  }
                >
                  <WaitlistDialog
                    triggerClassName="neu-btn inline-flex items-center justify-center rounded-pill px-7 py-3.5 text-[0.95rem] font-semibold text-white no-underline hover:text-white hover:no-underline"
                  />
                </Suspense>
              </div>
            </div>

            <div className="hero-phone relative mx-auto w-full max-w-[280px] opacity-0 lg:max-w-[300px]">
              <div className="neu-phone rounded-[32px]">
                <div className="overflow-hidden rounded-[22px] bg-ink">
                  <picture>
                    <source
                      srcSet="/assets/app-home.webp"
                      type="image/webp"
                    />
                    <img
                      src="/assets/app-home.png"
                      alt="Sportiv Discover screen showing a Padel partner card"
                      width={390}
                      height={844}
                      className="block w-full"
                      decoding="async"
                      fetchPriority="high"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-header py-8 md:py-10"
        >
          <Container>
            <div className="anime-reveal neu-raised rounded-[28px] p-6 opacity-0 md:p-8">
              <h2 className="section-title mb-6 text-center">How It Works</h2>
              <Suspense
                fallback={
                  <div className="min-h-[120px] text-ink-muted">Loading…</div>
                }
              >
                <HowItWorksTabs />
              </Suspense>
            </div>
          </Container>
        </section>

        <section id="about" className="scroll-mt-header py-8 md:py-10">
          <Container>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="anime-reveal neu-raised rounded-[28px] p-6 opacity-0 md:p-8">
                <h2 className="section-title mb-4">About Us</h2>
                <LineList
                  items={[
                    'A sports discovery app for 2-player games in Pakistan — discover, match, chat, then meet at a court.',
                    'Not a dating app. Chat stays behind mutual matches and real games.',
                    'Be respectful, show up, and keep chat sports-focused — with report and block tools.',
                    'Built in Pakistan for local courts, clubs, and players from day one.',
                  ]}
                />
              </div>

              <div
                id="contact"
                className="anime-reveal neu-raised scroll-mt-header rounded-[28px] p-6 opacity-0 md:p-8"
              >
                <h2 className="section-title mb-2">Contact Us</h2>
                <p className="body-copy mb-5">
                  Questions, partnerships, or feedback — we typically respond
                  within 2 business days.
                </p>
                {contactAction ? (
                  <form className="space-y-3.5" action={contactAction} method="POST">
                    <input
                      type="hidden"
                      name="_subject"
                      value="Sportiv contact"
                    />
                    <label className="block text-sm font-semibold text-ink">
                      Name <span className="font-medium text-ink-muted">(optional)</span>
                      <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        placeholder="Your name"
                        className="neu-input mt-1.5 w-full rounded-xl px-4 py-3 text-ink"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-ink">
                      Email
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="you@email.com"
                        className="neu-input mt-1.5 w-full rounded-xl px-4 py-3 text-ink"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-ink">
                      Message
                      <textarea
                        name="message"
                        required
                        rows={3}
                        placeholder="How can we help?"
                        className="neu-input mt-1.5 w-full rounded-xl px-4 py-3 text-ink"
                      />
                    </label>
                    <button
                      type="submit"
                      className="neu-btn inline-flex items-center justify-center rounded-pill px-7 py-3 text-[0.95rem] font-semibold text-white"
                    >
                      Send message
                    </button>
                    <p className="m-0 text-sm font-medium text-ink-muted">
                      Or email{' '}
                      <Link000 href="mailto:support@sportiv.app">
                        support@sportiv.app
                      </Link000>
                      .
                    </p>
                  </form>
                ) : (
                  <div className="space-y-3.5">
                    <p className="body-copy m-0">
                      The contact form isn’t configured yet. Reach us directly:
                    </p>
                    <a
                      href={SUPPORT_MAILTO}
                      className="neu-btn inline-flex items-center justify-center rounded-pill px-7 py-3 text-[0.95rem] font-semibold text-white no-underline hover:text-white hover:no-underline"
                    >
                      Email support@sportiv.app
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  )
}
