'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type TimeSlotsProps = {
  date: Date
  selected: string | null
  onSelect: (time: string) => void
}

type PublicTime = {
  time: string
  blocked: boolean
}

export function TimeSlots({ date, selected, onSelect }: TimeSlotsProps) {
  const [availableTimes, setAvailableTimes] = useState<PublicTime[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTimes() {
      setLoading(true)
      setError('')

      const dateString = date.toLocaleDateString('en-CA')

      try {
        const [availabilityResponse, bookedResponse] = await Promise.all([
          fetch(`/api/availability?date=${dateString}`, {
            cache: 'no-store',
          }),
          supabase.rpc('get_booked_times', {
            p_date: dateString,
          }),
        ])

        const availabilityResult = await availabilityResponse.json()

        if (!availabilityResponse.ok) {
          throw new Error(
            availabilityResult.error ??
              'Não foi possível carregar os horários.',
          )
        }

        if (bookedResponse.error) {
          throw bookedResponse.error
        }

        setAvailableTimes(availabilityResult.times ?? [])

        setBookedTimes(
          (bookedResponse.data ?? []).map(
            (booking: { horario: string }) =>
              booking.horario.slice(0, 5),
          ),
        )
      } catch (err) {
        console.error(err)

        setError(
          'Não foi possível carregar os horários desta data.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadTimes()
  }, [date])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">
          Carregando horários...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-sm text-destructive">
          {error}
        </p>
      </div>
    )
  }

  if (availableTimes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground">
          Nenhum horário disponível nesta data.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {availableTimes.map((slot) => {
        const isSelected = selected === slot.time
        const isBooked = bookedTimes.includes(slot.time)
        const isUnavailable = slot.blocked || isBooked

        return (
          <button
            key={slot.time}
            type="button"
            onClick={() =>
              !isUnavailable && onSelect(slot.time)
            }
            aria-pressed={isSelected}
            disabled={isUnavailable}
            className={cn(
              'flex items-center justify-between rounded-lg border px-5 py-4 text-left transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isUnavailable
                ? 'cursor-not-allowed border-border bg-muted text-muted-foreground opacity-60'
                : isSelected
                  ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-accent/50',
            )}
          >
            <span className="font-serif text-xl">
              {formatTimeLabel(slot.time)}
            </span>

            <span
              className={cn(
                'text-xs uppercase tracking-widest',
                isSelected
                  ? 'text-accent-foreground/70'
                  : 'text-muted-foreground',
              )}
            >
              {isUnavailable ? 'Indisponível' : 'Disponível'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(':')

  return minutes === '00'
    ? `${Number(hours)}h`
    : `${Number(hours)}h${minutes}`
}
