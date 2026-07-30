import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: { img: 28, text: 'text-lg', gap: 'gap-2' },
  md: { img: 34, text: 'text-[1.2rem]', gap: 'gap-2.5' },
  lg: { img: 48, text: 'text-2xl', gap: 'gap-3' },
} as const

type BrandMarkProps = {
  size?: keyof typeof SIZES
  className?: string
  asLink?: boolean
}

export function BrandMark({
  size = 'md',
  className,
  asLink = true,
}: BrandMarkProps) {
  const s = SIZES[size]
  const inner = (
    <>
      <img
        src="/assets/sportiv_logo.png"
        alt=""
        width={s.img}
        height={s.img}
        className="object-contain"
        style={{ width: s.img, height: s.img }}
      />
      <span className={cn('font-display font-bold tracking-tight text-ink', s.text)}>
        Sportiv
      </span>
    </>
  )

  const classes = cn(
    'inline-flex shrink-0 items-center text-ink no-underline hover:no-underline',
    s.gap,
    className,
  )

  if (asLink) {
    return (
      <Link to="/" className={classes} aria-label="Sportiv home">
        {inner}
      </Link>
    )
  }

  return <div className={classes}>{inner}</div>
}
