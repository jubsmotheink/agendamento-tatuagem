'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import type { BookingState } from '@/lib/booking/types'
import { STUDIO_TIME_SLOTS } from '@/lib/booking/config'
import { formatLongDate } from '@/lib/booking/dates'

type ReservationProps = {
  booking: BookingState
  onExpired: () => void
}

export function Reservation({ booking, onExpired }: ReservationProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const hasExpired = useRef(false)

  useEffect(() => {
    if (!booking.expiresAt) return

    hasExpired.current = false

    function updateTimer() {
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(booking.expiresAt!).getTime() - Date.now()) / 1000,
        ),
      )

      setRemainingSeconds(remaining)

      if (remaining === 0 && !hasExpired.current) {
        hasExpired.current = true
        onExpired()
      }
    }

    updateTimer()
    const interval = window.setInterval(updateTimer, 1000)

    return () => window.clearInterval(interval)
  }, [booking.expiresAt, onExpired])

  const timeLabel =
    STUDIO_TIME_SLOTS.find((slot) => slot.value === booking.time)?.label ??
    booking.time

  const dateLabel = booking.date ? formatLongDate(booking.date) : ''

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-border bg-card text-foreground">
        <Clock className="size-6" strokeWidth={1.5} />
      </div>

      <h2 className="font-serif text-2xl text-foreground text-balance">
        Horário reservado
      </h2>

      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        {booking.name.split(' ')[0]}, reservamos esse horário exclusivamente
        para você. Finalize o pagamento do sinal para confirmar seu agendamento.
      </p>

      <div className="mt-6 w-full rounded-lg border border-border bg-card px-5 py-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Sua reserva expira em
        </p>
        <p className="mt-2 font-serif text-3xl text-foreground">
          {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:
          {String(remainingSeconds % 60).padStart(2, '0')}
        </p>
      </div>

      <div className="mt-5 w-full rounded-lg border border-border bg-card text-left">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Data
          </span>
          <span className="text-sm text-foreground">{dateLabel}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Horário
          </span>
          <span className="text-sm text-foreground">{timeLabel}</span>
        </div>
      </div>

      <div className="mt-5 w-full rounded-lg border border-dashed border-border px-5 py-8">
        <p className="text-sm font-medium text-foreground">
          Pagamento do sinal
        </p>
        <p className="mt-2 font-serif text-2xl text-foreground">R$ 50,00</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          O pagamento será integrado aqui. Por enquanto, esta área está
          reservada para o QR Code e as informações do Pix.
        </p>
      </div>

      <p className="mt-5 max-w-xs text-xs leading-relaxed text-muted-foreground">
        O horário permanece reservado durante o período indicado acima. Após
        esse prazo, a reserva será liberada caso o pagamento não seja
        identificado.
      </p>
    </div>
  )
}
