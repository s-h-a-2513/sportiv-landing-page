export const NAV_ITEMS = [
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'players', label: 'For Players' },
  { id: 'facilities', label: 'For Facility Owners' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

export type NavSectionId = (typeof NAV_ITEMS)[number]['id']
