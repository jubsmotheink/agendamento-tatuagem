'use client'

import { Check } from 'lucide-react'
import { buildWhatsappLink, STUDIO_TIME_SLOTS } from '@/lib/booking/config'
import { formatLongDate } from '@/lib/booking/dates'
import type { BookingState } from '@/lib/booking/types'

type ConfirmationProps = {
  booking: BookingState
  onRestart: () => void
}

export function Confirmation({ booking, onRestart }: ConfirmationProps) {
  const timeLabel =
    STUDIO_TIME_SLOTS.find((s) => s.value === booking.time)?.label ?? booking.time
  const dateLabel = booking.date ? formatLongDate(booking.date) : ''
  const whatsappLink = buildWhatsappLink(dateLabel, timeLabel ?? '')

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Check className="size-6" strokeWidth={1.5} />
      </div>

      <h2 className="font-serif text-2xl text-foreground text-balance">
        Agendamento confirmado
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        {booking.name.split(' ')[0]}, reservamos seu horário com carinho. Em
        breve entraremos em contato pelo WhatsApp para os últimos detalhes.
      </p>
      <dl className="mt-8 w-full divide-y divide-border rounded-lg border border-border bg-card text-left">
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            E-mail
          </dt>
          <dd className="max-w-[65%] break-all text-right text-sm text-foreground">
            {booking.email}
          </dd>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            Data
          </dt>
          <dd className="text-sm text-foreground">
            {booking.date ? formatLongDate(booking.date) : '—'}
          </dd>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            Horário
          </dt>
          <dd className="text-sm text-foreground">{timeLabel}</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            Nome
          </dt>
          <dd className="text-sm text-foreground">{booking.name}</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            WhatsApp
          </dt>
          <dd className="text-sm text-foreground">{booking.whatsapp}</dd>
        </div>
      </dl>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Continuar no WhatsApp
      </a>

      <button
        type="button"
        onClick={onRestart}
        className="mt-5 text-sm uppercase tracking-widest text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Fazer novo agendamento
      </button>
    </div>
  )
}
