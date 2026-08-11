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
const [showPolicy, setShowPolicy] = useState(false)
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
<div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
  <p className="text-xs leading-relaxed text-muted-foreground">
    Ao confirmar e realizar o pagamento do sinal de R$ 50, você declara
    estar de acordo com a{' '}
    <button
      type="button"
      onClick={() => setShowPolicy(true)}
      className="font-medium text-foreground underline underline-offset-2"
    >
      Política de Sinal e Agendamento
    </button>
    .
  </p>
</div>
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
      {showPolicy && (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
    onClick={() => setShowPolicy(false)}
  >
    <div
      className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary/70">
            Agendamento
          </p>

          <h3 className="mt-1 font-serif text-2xl text-foreground">
            Política de Sinal e Agendamento
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowPolicy(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Fechar
        </button>
      </div>

      <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
        <section>
          <p className="font-medium text-foreground">
            1. Reserva do horário
          </p>
          <p className="mt-1">
            O agendamento é confirmado somente após o pagamento do sinal
            de R$ 50,00. O horário escolhido fica reservado por 5 minutos
            para que o pagamento seja realizado.
          </p>
        </section>

        <section>
          <p className="font-medium text-foreground">
            2. Abatimento no valor da tatuagem
          </p>
          <p className="mt-1">
            O valor do sinal é integralmente abatido do valor final da
            tatuagem no dia do atendimento. Portanto, o sinal não é uma
            cobrança adicional ao valor combinado.
          </p>
        </section>

        <section>
          <p className="font-medium text-foreground">
            3. Remarcação
          </p>
          <p className="mt-1">
            O sinal garante o direito a 1 remarcação, desde que solicitada
            com no mínimo 48 horas de antecedência em relação ao horário
            agendado.
          </p>
          <p className="mt-2">
            A nova data deverá ser escolhida dentro do prazo de 30 dias a
            partir da data original do agendamento.
          </p>
        </section>

        <section>
          <p className="font-medium text-foreground">
            4. Cancelamento e perda do sinal
          </p>
          <p className="mt-1">
            O sinal é uma garantia de reserva do horário e, por isso, não
            é reembolsável em caso de cancelamento, desistência ou
            remarcação solicitada fora das condições descritas acima.
          </p>
        </section>

        <section>
          <p className="font-medium text-foreground">
            5. Ausência
          </p>
          <p className="mt-1">
            O não comparecimento no horário agendado, sem aviso prévio
            dentro do prazo estabelecido, implica na perda do sinal.
          </p>
        </section>

        <section>
          <p className="font-medium text-foreground">
            6. Novo agendamento
          </p>
          <p className="mt-1">
            Após a perda do sinal, caso queira realizar um novo
            agendamento, será necessário efetuar um novo pagamento de
            sinal, conforme o valor vigente no momento da nova reserva.
          </p>
        </section>

        <p className="border-t border-border pt-4 font-medium text-foreground">
          Ao realizar o pagamento, você declara estar de acordo com esta
          política.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowPolicy(false)}
        className="mt-6 w-full rounded-lg bg-primary px-5 py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground"
      >
        Entendi
      </button>
    </div>
  </div>
)}
    </div>
  )
}
