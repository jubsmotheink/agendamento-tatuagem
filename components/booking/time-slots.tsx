'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { getAvailableTimes } from '@/lib/booking/config'

type TimeSlotsProps = {
  date: Date
  selected: string | null
  onSelect: (time: string) => void
}

export function TimeSlots({ date, selected, onSelect }: TimeSlotsProps) {
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  useEffect(() => {
    async function loadBookedTimes() {
      const dateString = date.toLocaleDateString('en-CA')
console.log('DATA SELECIONADA:', dateString)

      const { data, error } = await supabase
  .rpc('get_booked_times', { p_date: dateString })

      if (error) {
  console.error('ERRO AO BUSCAR HORÁRIOS:', error)
  return
}

console.log('HORÁRIOS RESERVADOS:', data)

      setBookedTimes(
        (data ?? []).map((booking: { horario: string }) => booking.horario),
      )
    }

    loadBookedTimes()
  }, [date])
  const times = getAvailableTimes(date)

  return (
    <div className="flex flex-col gap-3">
      {times.map((slot) => {
        const isSelected = selected === slot.value
        const isBooked = bookedTimes.includes(slot.value)
        return (
          <button
            key={slot.value}
            type="button"
            onClick={() => !isBooked && onSelect(slot.value)}
            aria-pressed={isSelected}
            disabled={isBooked}
            className={cn(
  'flex items-center justify-between rounded-lg border px-5 py-4 text-left transition-all',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  isBooked
    ? 'border-border bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
    : isSelected
      ? 'border-accent bg-accent text-accent-foreground shadow-sm'
      : 'border-border bg-card text-foreground hover:border-accent/50',
)}
          >
            <span className="font-serif text-xl">{slot.label}</span>
            <span
              className={cn(
                'text-xs uppercase tracking-widest',
                isSelected ? 'text-accent-foreground/70' : 'text-muted-foreground',
              )}
            >
              {isBooked ? 'Indisponível' : 'Disponível'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
