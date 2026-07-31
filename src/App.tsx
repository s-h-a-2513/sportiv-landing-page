import { Outlet } from 'react-router-dom'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export function AppLayout() {
  return (
    <div className="bg-wash-scene relative min-h-screen">
      <div
        className="bg-wash-scene pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      />
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  )
}
