import { lazy, Suspense } from 'react'
import { Container } from '@/components/ui'
import { BrandMark } from '@/components/BrandMark'
import { ContactForm } from '@/components/ContactForm'
import { OwnerDashboardLink } from '@/components/OwnerDashboardLink'
import { usePageMotion } from '@/hooks/useAnimeScope'

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

export function HomePage() {
  const { root } = usePageMotion()

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
                <OwnerDashboardLink className="neu-btn inline-flex items-center justify-center rounded-pill px-7 py-3.5 text-[0.95rem] font-semibold text-white no-underline hover:text-white hover:no-underline" />
              </div>
            </div>

            <div className="hero-phone relative mx-auto w-full max-w-[280px] opacity-0 lg:max-w-[300px]">
              <div className="phone-stage" aria-hidden />
              <div className="phone-device">
                <div className="phone-screen">
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
                  <span className="phone-island" aria-hidden />
                  <span className="phone-home" aria-hidden />
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
                <ContactForm />
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  )
}
