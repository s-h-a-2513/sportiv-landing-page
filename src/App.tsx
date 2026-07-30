import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export function AppLayout() {
  return (
    <div className="relative min-h-screen bg-wash-scene">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-wash-scene"
        aria-hidden
      />
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  )
}
