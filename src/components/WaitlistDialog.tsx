import { useForm, ValidationError } from '@formspree/react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/core/dialog'
import { cn } from '@/lib/utils'
import { WAITLIST_FORMSPREE_ID } from '@/lib/formspree'

const waitlistVariants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
}

type WaitlistDialogProps = {
  triggerLabel?: string
  triggerClassName?: string
  onOpen?: () => void
}

function WaitlistForm() {
  const [state, handleSubmit] = useForm(WAITLIST_FORMSPREE_ID)

  if (state.succeeded) {
    return (
      <p className="body-copy m-0 text-[0.95rem]">
        You’re on the list — we’ll email you when Sportiv launches on Google
        Play.
      </p>
    )
  }

  return (
    <form className="space-y-4 text-left" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="Sportiv waitlist signup" />
      <input type="hidden" name="form" value="waitlist" />
      <label className="block text-sm font-semibold text-ink">
        Name <span className="font-medium text-ink-muted">(optional)</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          className="neu-input mt-1.5 w-full rounded-[20px] px-3.5 py-2.5 text-sm text-ink"
        />
      </label>
      <label className="block text-sm font-semibold text-ink">
        Email
        <input
          id="waitlist-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="neu-input mt-1.5 w-full rounded-[20px] px-3.5 py-2.5 text-sm text-ink"
        />
      </label>
      <ValidationError
        prefix="Email"
        field="email"
        errors={state.errors}
        className="mt-1.5 block text-xs text-red-600 dark:text-red-400"
      />
      <ValidationError
        errors={state.errors}
        className="mt-1.5 block text-xs text-red-600 dark:text-red-400"
      />
      <button
        type="submit"
        disabled={state.submitting}
        className="neu-btn w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.submitting ? 'Joining…' : 'Join the waitlist'}
      </button>
      <p className="m-0 text-center text-sm font-medium text-ink-muted">
        No spam — launch updates only.
      </p>
    </form>
  )
}

export function WaitlistDialog({
  triggerLabel = 'Join the waitlist',
  triggerClassName,
  onOpen,
}: WaitlistDialogProps) {
  return (
    <Dialog
      variants={waitlistVariants}
      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
      onOpenChange={(open) => {
        if (open) onOpen?.()
      }}
    >
      <DialogTrigger className={cn(triggerClassName)}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent
        className={cn(
          'relative w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-[28px] border-0 bg-[var(--neu-bg)] p-6 md:p-8',
          'neu-raised',
          'backdrop:bg-[#1A1410]/55 backdrop:backdrop-blur-md',
        )}
      >
        <DialogClose className="text-ink-muted hover:text-ink" />
        <DialogHeader className="mb-5 pr-8 text-left">
          <DialogTitle className="font-display text-xl font-bold tracking-tight text-ink">
            Coming Soon on Android
          </DialogTitle>
          <DialogDescription className="body-copy text-[0.95rem]">
            Join the waitlist and we’ll email you when Sportiv is ready on Google
            Play.
          </DialogDescription>
        </DialogHeader>
        <WaitlistForm />
      </DialogContent>
    </Dialog>
  )
}
