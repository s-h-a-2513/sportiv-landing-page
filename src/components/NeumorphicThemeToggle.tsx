import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const modes = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const

type NeumorphicThemeToggleProps = {
  className?: string
}

/** Matches Sportiv Owner App theme control: light / dark / system. */
export function NeumorphicThemeToggle({ className }: NeumorphicThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'neu-theme-toggle inline-flex h-9 w-[108px] rounded-pill',
          className,
        )}
        aria-hidden
      />
    )
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        'neu-theme-toggle inline-flex items-center gap-0.5 rounded-pill p-1',
        className,
      )}
    >
      {modes.map(({ value, icon: Icon, label }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border-0 transition-colors',
              active
                ? 'neu-theme-knob neu-theme-knob-ready text-court'
                : 'bg-transparent text-ink-muted hover:text-ink',
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        )
      })}
    </div>
  )
}
