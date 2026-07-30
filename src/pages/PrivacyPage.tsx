import { Link } from 'react-router-dom'
import { Container } from '@/components/ui'
import { Link000 } from '@/components/ui/skiper-ui/skiper40'
import { useEffect } from 'react'

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Sportiv'
    return () => {
      document.title = 'Sportiv — Find your next game partner'
    }
  }, [])

  return (
    <main>
      <section className="scroll-mt-header pb-4 pt-12 md:pt-16">
        <Container>
          <span className="mb-3 inline-block text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-court">
            Legal
          </span>
          <h1 className="mb-3 font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="m-0 max-w-[42ch] text-lg text-ink-muted">
            This page will describe how Sportiv collects, uses, and protects your
            information. A full policy will be published before public launch.
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="neu-raised max-w-[62ch] space-y-4 rounded-[24px] p-8 text-ink-muted md:p-10">
            <p>
              Until the full Privacy Policy is available, contact us with any
              privacy questions at{' '}
              <Link000 href="mailto:support@sportiv.app">
                support@sportiv.app
              </Link000>
              .
            </p>
            <p>
              Sportiv is a sports matching product. We intend to process only the
              data needed to run accounts, discovery, matching, chat after mutual
              matches, and safety features such as report and block — and to
              communicate launch updates if you join the waitlist.
            </p>
            <p>
              We will update this page with clear details on data categories,
              retention, sharing, and your rights before the Android release on
              Google Play.
            </p>
            <p>
              <Link to="/" className="font-medium text-court">
                ← Back to Sportiv
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </main>
  )
}
