import { useForm, ValidationError } from '@formspree/react'
import { Link000 } from '@/components/ui/skiper-ui/skiper40'
import { CONTACT_FORMSPREE_ID } from '@/lib/formspree'

export function ContactForm() {
  const [state, handleSubmit] = useForm(CONTACT_FORMSPREE_ID)

  if (state.succeeded) {
    return (
      <p className="body-copy m-0">
        Thanks — we received your message and typically reply within 2 business
        days.
      </p>
    )
  }

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="Sportiv contact" />
      <input type="hidden" name="form" value="contact" />
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
          id="contact-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="neu-input mt-1.5 w-full rounded-xl px-4 py-3 text-ink"
        />
      </label>
      <ValidationError
        prefix="Email"
        field="email"
        errors={state.errors}
        className="block text-sm font-medium text-red-700"
      />
      <label className="block text-sm font-semibold text-ink">
        Message
        <textarea
          id="contact-message"
          name="message"
          required
          rows={3}
          placeholder="How can we help?"
          className="neu-input mt-1.5 w-full rounded-xl px-4 py-3 text-ink"
        />
      </label>
      <ValidationError
        prefix="Message"
        field="message"
        errors={state.errors}
        className="block text-sm font-medium text-red-700"
      />
      <ValidationError
        errors={state.errors}
        className="block text-sm font-medium text-red-700"
      />
      <button
        type="submit"
        disabled={state.submitting}
        className="neu-btn inline-flex items-center justify-center rounded-pill px-7 py-3 text-[0.95rem] font-semibold text-white disabled:opacity-70"
      >
        {state.submitting ? 'Sending…' : 'Send message'}
      </button>
      <p className="m-0 text-sm font-medium text-ink-muted">
        Or email{' '}
        <Link000 href="mailto:support@sportiv.app">support@sportiv.app</Link000>
        .
      </p>
    </form>
  )
}
