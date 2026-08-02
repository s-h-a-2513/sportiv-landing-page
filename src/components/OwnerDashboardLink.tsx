import { OWNER_APP_URL, OWNER_CTA_LABEL } from '@/lib/owner'
import { cn } from '@/lib/utils'

type OwnerDashboardLinkProps = {
  className?: string
  label?: string
  onClick?: () => void
}

export function OwnerDashboardLink({
  className,
  label = OWNER_CTA_LABEL,
  onClick,
}: OwnerDashboardLinkProps) {
  return (
    <a
      href={OWNER_APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
      onClick={onClick}
    >
      {label}
    </a>
  )
}
