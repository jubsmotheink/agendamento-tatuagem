'use client'

import { formatLongDate } from '@/lib/booking/dates'
import type { BookingState } from '@/lib/booking/types'

type ReviewProps = {
  booking: BookingState
  timeLabel: string
  onConfirm: () => void
}

export function Review({ booking, timeLabel, onConfirm }: ReviewProps) {
  const rows = [
    { label: 'Data', value: booking.date ? formatLongDate(booking.date) : '—' },
    { label: 'Horário', value: timeLabel },
    { label: 'Nome', value: booking.name },
    { label: 'E-mail', value: booking.email },
    { label: 'WhatsApp', value: booking.whatsapp },
  ]

  return (
    <div className="flex flex-col gap-6">
      <dl className="w-full divide-y divide-border rounded-lg border border-border bg-card">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">
              {row.label}
            </dt>
            <dd className="text-right text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onConfirm}
        className="w-full rounded-lg bg-primary px-5 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Confirmar horário
      </button>
    </div>
  )
}
