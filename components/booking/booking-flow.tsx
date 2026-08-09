'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { STUDIO_HANDLE, STUDIO_NAME, STUDIO_TIME_SLOTS } from '@/lib/booking/config'
import { formatLongDate } from '@/lib/booking/dates'
import { initialBookingState, type BookingState, type BookingStep } from '@/lib/booking/types'
import { Calendar } from './calendar'
import { TimeSlots } from './time-slots'
import { ContactForm } from './contact-form'
import { Review } from './review'
import { Reservation } from './reservation'
import { Expired } from './expired'
import { Confirmation } from './confirmation'
import { StepIndicator } from './step-indicator'

export function BookingFlow() {
  const [step, setStep] = useState<BookingStep>('schedule')
  const [booking, setBooking] = useState<BookingState>(initialBookingState)

  function selectDate(date: Date) {
    // Ao trocar de data, limpamos o horário para forçar nova escolha.
    setBooking((prev) => ({ ...prev, date, time: null }))
  }

  function selectTime(time: string) {
    setBooking((prev) => ({ ...prev, time }))
    setStep('contact')
  }

  function submitContact(data: { name: string; whatsapp: string; email: string }) {
    setBooking((prev) => ({ ...prev, ...data }))
    setStep('review')
  }

  async function confirm() {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: booking.name,
        whatsapp: booking.whatsapp,
        email: booking.email,
        date: booking.date?.toISOString(),
        time: booking.time,
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      console.error(result)
      window.alert(result.error ?? 'Não foi possível gerar o Pix. Tente novamente.')
      return
    }

    setBooking((prev) => ({
      ...prev,
      expiresAt: result.expiresAt,
      reservationId: result.reservationId,
      pixOrderId: result.orderId,
      pixQrCode: result.qrCode,
      pixQrCodeBase64: result.qrCodeBase64,
      pixTicketUrl: result.ticketUrl,
    }))
    setStep('reservation')
  }

  function restart() {
    setBooking(initialBookingState)
    setStep('schedule')
  }

  async function expireReservation() {
    if (booking.reservationId) {
      await fetch(`/api/reservations/${booking.reservationId}/expire`, {
        method: 'POST',
      }).catch(() => undefined)
    }
    setStep('expired')
  }

  const timeLabel = STUDIO_TIME_SLOTS.find((s) => s.value === booking.time)?.label

  return (
    <div className="w-full max-w-md">
      <header className="mb-10 text-center">
        <p className="mb-2 text-xs tracking-[0.2em] text-primary/70">
          {STUDIO_HANDLE}
        </p>
        <h1 className="font-serif text-3xl tracking-wide text-foreground text-balance">
          {STUDIO_NAME}
        </h1>
      </header>

      {step !== 'confirmation' && step !== 'expired' && (
        <StepIndicator current={step} className="mb-8" />
      )}

      <section
        key={step}
        className="animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        {step === 'schedule' && (
          <div>
            <StepHeading
              title="Escolha seu horário"
              subtitle="Selecione uma data para conferir os horários disponíveis."
            />
            <Calendar selected={booking.date} onSelect={selectDate} />

            {booking.date && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-1 duration-400">
                <p className="mb-4 text-sm text-muted-foreground text-pretty">
                  {formatLongDate(booking.date)}
                </p>
                <TimeSlots
                  date={booking.date}
                  selected={booking.time}
                  onSelect={selectTime}
                />
              </div>
            )}
          </div>
        )}

        {step === 'contact' && (
          <div>
            <BackButton
              label="Voltar para o horário"
              onClick={() => setStep('schedule')}
            />
            <StepHeading
              title="Quase lá"
              subtitle="Para reservar esse horário, preciso de alguns dados."
            />
            <ContactForm
              name={booking.name}
              whatsapp={booking.whatsapp}
              email={booking.email}
              onSubmit={submitContact}
            />
          </div>
        )}

        {step === 'review' && (
          <div>
            <BackButton
              label="Editar dados"
              onClick={() => setStep('contact')}
            />
            <StepHeading title="Confira sua reserva" />
            <Review
              booking={booking}
              timeLabel={timeLabel ?? booking.time ?? ''}
              onConfirm={confirm}
            />
          </div>
        )}

        {step === 'reservation' && (
          <Reservation
            booking={booking}
            onExpired={expireReservation}
            onConfirmed={() => setStep('confirmation')}
          />
        )}
        {step === 'expired' && <Expired onRestart={restart} />}
        {step === 'confirmation' && (
          <Confirmation booking={booking} onRestart={restart} />
        )}
      </section>
    </div>
  )
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl text-foreground text-balance">{title}</h2>
      {subtitle && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-5 -ml-1 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" strokeWidth={1.5} />
      {label}
    </button>
  )
}
