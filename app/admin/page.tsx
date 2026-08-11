'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  LogOut,
  RefreshCw,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type AdminSection = 'agenda' | 'reservas'

type Reservation = {
  id: number
  created_at: string
  nome: string
  telefone: string
  email: string
  data: string
  horario: string
  status: string
  pagamento_status: string
}

export default function AdminPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<AdminSection>('agenda')

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(false)
  const [reservationsError, setReservationsError] = useState('')

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/admin/login')
        return
      }

      setLoading(false)
    }

    checkSession()
  }, [router])

  useEffect(() => {
    if (!loading && section === 'reservas') {
      loadReservations()
    }
  }, [loading, section])

  async function loadReservations() {
    setReservationsLoading(true)
    setReservationsError('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/admin/login')
      return
    }

    try {
      const response = await fetch('/api/admin/reservations', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ?? 'Não foi possível carregar as reservas.',
        )
      }

      setReservations(result.reservations ?? [])
    } catch (error) {
      setReservationsError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as reservas.',
      )
    } finally {
      setReservationsLoading(false)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando painel...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary/70">
              Jullia Mothé Tattoo
            </p>

            <h1 className="mt-1 font-serif text-3xl text-foreground">
              Painel administrativo
            </h1>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 self-start text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            Sair
          </button>
        </header>

        <nav className="mt-6 flex gap-2 rounded-xl border border-border bg-card p-1.5">
          <button
            type="button"
            onClick={() => setSection('agenda')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
              section === 'agenda'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <CalendarDays className="size-4" strokeWidth={1.5} />
            Agenda
          </button>

          <button
            type="button"
            onClick={() => setSection('reservas')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
              section === 'reservas'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <Users className="size-4" strokeWidth={1.5} />
            Reservas
          </button>
        </nav>

        <section className="mt-8">
          {section === 'agenda' && (
            <div>
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-foreground">
                  Gerenciar agenda
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Abra datas e defina os horários disponíveis para atendimento.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  O gerenciamento de horários será conectado aqui no próximo
                  passo.
                </p>
              </div>
            </div>
          )}

          {section === 'reservas' && (
            <div>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-foreground">
                    Reservas
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Acompanhe clientes, horários e pagamentos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadReservations}
                  disabled={reservationsLoading}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw
                    className={`size-4 ${
                      reservationsLoading ? 'animate-spin' : ''
                    }`}
                    strokeWidth={1.5}
                  />
                  Atualizar
                </button>
              </div>

              {reservationsLoading && reservations.length === 0 && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">
                    Carregando reservas...
                  </p>
                </div>
              )}

              {reservationsError && (
                <div className="rounded-xl border border-destructive/30 bg-card p-6">
                  <p className="text-sm text-destructive">
                    {reservationsError}
                  </p>
                </div>
              )}

              {!reservationsLoading &&
                !reservationsError &&
                reservations.length === 0 && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma reserva encontrada.
                    </p>
                  </div>
                )}

              <div className="flex flex-col gap-4">
                {reservations.map((reservation) => (
                  <article
                    key={reservation.id}
                    className="rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-serif text-xl text-foreground">
                          {reservation.nome}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(reservation.data)} ·{' '}
                          {formatTime(reservation.horario)}
                        </p>
                      </div>

                      <StatusBadge status={reservation.status} />
                    </div>

                    <dl className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                      <ReservationInfo
                        label="WhatsApp"
                        value={reservation.telefone}
                      />

                      <ReservationInfo
                        label="E-mail"
                        value={reservation.email}
                      />

                      <ReservationInfo
                        label="Pagamento"
                        value={formatStatus(reservation.pagamento_status)}
                      />

                      <ReservationInfo
                        label="Reserva"
                        value={`#${reservation.id}`}
                      />
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function ReservationInfo({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm text-foreground">
        {value || '—'}
      </dd>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase()

  const className =
    normalized === 'confirmado'
      ? 'bg-green-100 text-green-800'
      : normalized === 'pendente'
        ? 'bg-yellow-100 text-yellow-800'
        : normalized === 'cancelado'
          ? 'bg-red-100 text-red-800'
          : 'bg-secondary text-muted-foreground'

  return (
    <span
      className={`self-start rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${className}`}
    >
      {formatStatus(status)}
    </span>
  )
}

function formatStatus(status: string) {
  if (!status) return '—'

  return status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ')
}

function formatTime(time: string) {
  if (!time) return '—'

  return time.slice(0, 5)
}

function formatDate(value: string) {
  if (!value) return '—'

  const date = new Date(value)

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(date)
}
