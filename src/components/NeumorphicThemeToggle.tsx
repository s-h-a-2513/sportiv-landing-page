import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

type NeumorphicThemeToggleProps = {
  className?: string
}

export function NeumorphicThemeToggle({ className }: NeumorphicThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className={cn(
        'neu-theme-toggle relative inline-flex h-10 w-[4.5rem] shrink-0 items-center rounded-pill border-0 p-1',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5"
        aria-hidden
      >
        <Sun
          className={cn(
            'h-3.5 w-3.5 transition-colors duration-200',
            isDark ? 'text-ink-muted/50' : 'text-court',
          )}
          strokeWidth={2.25}
        />
        <Moon
          className={cn(
            'h-3.5 w-3.5 transition-colors duration-200',
            isDark ? 'text-court' : 'text-ink-muted/50',
          )}
          strokeWidth={2.25}
        />
      </span>
      <span
        className={cn(
          'neu-theme-knob relative z-[1] block h-8 w-8 rounded-full',
          mounted && 'neu-theme-knob-ready',
          isDark && 'neu-theme-knob-dark',
        )}
      />
    </button>
  )
}
