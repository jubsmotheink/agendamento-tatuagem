'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  WEEKDAY_LABELS,
  addMonths,
  formatMonthYear,
  getCalendarDays,
  isPast,
  isSameDay,
  isSameMonth,
  startOfDay,
} from '@/lib/booking/dates'

type CalendarProps = {
  selected: Date | null
  onSelect: (date: Date) => void
}

export function Calendar({ selected, onSelect }: CalendarProps) {
  const today = startOfDay(new Date())

  const [viewMonth, setViewMonth] = useState<Date>(
    selected ? new Date(selected) : today,
  )

  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(true)

  const days = getCalendarDays(viewMonth)
  const canGoBack = !isSameMonth(viewMonth, today)

  useEffect(() => {
    async function loadMonthAvailability() {
      setLoadingAvailability(true)

      const year = viewMonth.getFullYear()
      const month = viewMonth.getMonth() + 1

      try {
        const response = await fetch(
          `/api/availability/month?year=${year}&month=${month}`,
          {
            cache: 'no-store',
          },
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error ?? 'Não foi possível carregar o calendário.',
          )
        }

        setAvailableDates(result.availableDates ?? [])
      } catch (error) {
        console.error('Erro ao carregar disponibilidade mensal:', error)

        setAvailableDates([])
      } finally {
        setLoadingAvailability(false)
      }
    }

    loadMonthAvailability()
  }, [viewMonth])

  function dateKey(date: Date) {
    return date.toLocaleDateString('en-CA')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            canGoBack && setViewMonth(addMonths(viewMonth, -1))
          }
          disabled={!canGoBack}
          aria-label="Mês anterior"
          className="flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-4" strokeWidth={1.5} />
        </button>

        <span
          className="font-serif text-lg tracking-wide text-foreground"
          aria-live="polite"
        >
          {formatMonthYear(viewMonth)}
        </span>

        <button
          type="button"
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          aria-label="Próximo mês"
          className="flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-secondary"
        >
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="flex h-8 items-center justify-center text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, outside }, i) => {
          const hasAvailability = availableDates.includes(dateKey(date))

          const disabled =
            outside ||
            isPast(date) ||
            (!loadingAvailability && !hasAvailability)

          const isSelected =
            selected != null && isSameDay(date, selected)

          const isToday = isSameDay(date, today)

          return (
            <div key={i} className="flex items-center justify-center">
              {outside ? (
                <span className="size-10" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(startOfDay(date))}
                  aria-label={date.toLocaleDateString('pt-BR')}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full text-sm transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    disabled &&
                      'cursor-not-allowed text-muted-foreground/40 line-through decoration-1',
                    !disabled &&
                      !isSelected &&
                      'text-foreground hover:bg-secondary',
                    isSelected &&
                      'bg-accent text-accent-foreground shadow-sm',
                    !isSelected &&
                      isToday &&
                      !disabled &&
                      'ring-1 ring-border',
                  )}
                >
                  {date.getDate()}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
