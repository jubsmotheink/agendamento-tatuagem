import { cn } from '@/lib/utils'
import type { BookingStep } from '@/lib/booking/types'

const STEPS: { key: BookingStep; label: string }[] = [
  { key: 'schedule', label: 'Horário' },
  { key: 'contact', label: 'Dados' },
  { key: 'review', label: 'Revisão' },
]

export function StepIndicator({
  current,
  className,
}: {
  current: BookingStep
  className?: string
}) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {STEPS.map((s, i) => {
        const active = i === currentIndex
        const done = i < currentIndex
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                active ? 'w-8 bg-accent' : 'w-1.5',
                done ? 'bg-accent/50' : !active && 'bg-border',
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                'text-xs uppercase tracking-widest transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground/60',
              )}
            >
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
