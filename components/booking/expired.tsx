import { ClockAlert } from 'lucide-react'

type ExpiredProps = {
  onRestart: () => void
}

export function Expired({ onRestart }: ExpiredProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-border bg-card text-foreground">
        <ClockAlert className="size-6" strokeWidth={1.5} />
      </div>

      <h2 className="font-serif text-2xl text-foreground text-balance">
        Tempo de reserva encerrado
      </h2>

      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
        O pagamento não foi identificado dentro do prazo e o horário foi
        liberado para novos agendamentos.
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Escolher outro horário
      </button>
    </div>
  )
}
