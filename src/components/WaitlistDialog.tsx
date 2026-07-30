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
import {
  SUPPORT_MAILTO,
  WAITLIST_FORMSPREE_ID,
  formspreeAction,
} from '@/lib/formspree'

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

export function WaitlistDialog({
  triggerLabel = 'Join the waitlist',
  triggerClassName,
  onOpen,
}: WaitlistDialogProps) {
  const action = formspreeAction(WAITLIST_FORMSPREE_ID)

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
          'relative w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-white/40 bg-[var(--neu-bg)] p-6 sm:p-8',
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
        {action ? (
          <form className="space-y-4 text-left" action={action} method="POST">
            <input
              type="hidden"
              name="_subject"
              value="Sportiv waitlist signup"
            />
            <label className="block text-sm font-medium text-ink">
              Name <span className="text-ink-muted">(optional)</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                className="neu-input mt-1.5 w-full rounded-xl px-4 py-3 text-ink"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
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
            <button
              type="submit"
              className="neu-btn w-full rounded-pill px-7 py-3.5 text-[0.95rem] font-semibold text-white"
            >
              Join the waitlist
            </button>
            <p className="m-0 text-center text-sm text-ink-muted">
              No spam — launch updates only.
            </p>
          </form>
        ) : (
          <div className="space-y-4 text-left">
            <p className="m-0 text-sm text-ink-muted">
              Waitlist signup isn’t configured yet. Email us and we’ll add you
              manually.
            </p>
            <a
              href={`${SUPPORT_MAILTO.replace('inquiry', 'waitlist')}`}
              className="neu-btn inline-flex w-full items-center justify-center rounded-pill px-7 py-3.5 text-[0.95rem] font-semibold text-white no-underline hover:text-white hover:no-underline"
            >
              Email support@sportiv.app
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
