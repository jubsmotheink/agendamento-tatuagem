'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import { STUDIO_HANDLE, STUDIO_NAME, STUDIO_TIME_SLOTS } from '@/lib/booking/config'
import { formatLongDate } from '@/lib/booking/dates'
import { initialBookingState, type BookingState, type BookingStep } from '@/lib/booking/types'
import { Calendar } from './calendar'
import { TimeSlots } from './time-slots'
import { ContactForm } from './contact-form'
import { Review } from './review'
import { Reservation } from './reservation'
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

  function submitContact(data: { name: string; whatsapp: string }) {
    setBooking((prev) => ({ ...prev, ...data }))
    setStep('review')
  }

  async function confirm() {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  const { error } = await supabase
    .from('agendamentos')
    .insert({
      nome: booking.name,
      telefone: booking.whatsapp,
      data: booking.date?.toISOString(),
      horario: booking.time,
      status: 'pendente',
      expires_at: expiresAt.toISOString(),
    })

  if (error) {
    console.error(error)
    return
  }

  setBooking((prev) => ({
    ...prev,
    expiresAt: expiresAt.toISOString(),
  }))

  setStep('reservation')
}

  function restart() {
    setBooking(initialBookingState)
    setStep('schedule')
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

      {step !== 'confirmation' && (
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
    onExpired={restart}
  />
)}
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
