'use client'

import { useState } from 'react'
import { formatLongDate } from '@/lib/booking/dates'
import type { BookingState } from '@/lib/booking/types'

type ReviewProps = {
  booking: BookingState
  timeLabel: string
  onConfirm: () => void | Promise<void>
}

export function Review({ booking, timeLabel, onConfirm }: ReviewProps) {
  const [confirming, setConfirming] = useState(false)

  const rows = [
    { label: 'Data', value: booking.date ? formatLongDate(booking.date) : '—' },
    { label: 'Horário', value: timeLabel },
    { label: 'Nome', value: booking.name },
    { label: 'E-mail', value: booking.email },
    { label: 'WhatsApp', value: booking.whatsapp },
  ]

  async function handleConfirm() {
    if (confirming) return

    setConfirming(true)

    try {
      await onConfirm()
    } finally {
      setConfirming(false)
    }
  }

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

            <dd className="text-right text-sm text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        className={`w-full rounded-lg px-5 py-3.5 text-sm font-medium uppercase tracking-widest transition-all ${
          confirming
            ? 'cursor-not-allowed bg-secondary text-muted-foreground opacity-70'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        }`}
      >
        {confirming ? 'Gerando Pix...' : 'Confirmar horário'}
      </button>
    </div>
  )
}
