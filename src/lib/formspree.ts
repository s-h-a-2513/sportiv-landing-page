/** Formspree form IDs — public (not secrets). Overridable via Vite env. */

export const DEFAULT_FORMSPREE_ID = 'xqeroeoo'

export function resolveFormspreeId(envValue: string | undefined): string {
  const trimmed = envValue?.trim()
  if (!trimmed || trimmed.startsWith('YOUR_')) return DEFAULT_FORMSPREE_ID
  return trimmed
}

/** @deprecated Prefer resolveFormspreeId + @formspree/react */
export function formspreeAction(id: string | undefined): string | null {
  const resolved = resolveFormspreeId(id)
  return `https://formspree.io/f/${resolved}`
}

export const WAITLIST_FORMSPREE_ID = resolveFormspreeId(
  import.meta.env.VITE_FORMSPREE_WAITLIST_ID,
)

export const CONTACT_FORMSPREE_ID = resolveFormspreeId(
  import.meta.env.VITE_FORMSPREE_CONTACT_ID,
)

export const SUPPORT_MAILTO =
  'mailto:support@sportiv.app?subject=Sportiv%20inquiry'
