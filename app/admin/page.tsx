'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, LogOut, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type AdminSection = 'agenda' | 'reservas'

export default function AdminPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<AdminSection>('agenda')

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
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-foreground">
                  Reservas
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Acompanhe clientes, horários e pagamentos.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                  As reservas serão carregadas aqui no próximo passo.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
