/** Formspree IDs — set via Vite env (public, not secrets). */

export function formspreeAction(id: string | undefined): string | null {
  const trimmed = id?.trim()
  if (!trimmed || trimmed.startsWith('YOUR_')) return null
  return `https://formspree.io/f/${trimmed}`
}

export const WAITLIST_FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_WAITLIST_ID as
  | string
  | undefined

export const CONTACT_FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_CONTACT_ID as
  | string
  | undefined

export const SUPPORT_MAILTO =
  'mailto:support@sportiv.app?subject=Sportiv%20inquiry'
