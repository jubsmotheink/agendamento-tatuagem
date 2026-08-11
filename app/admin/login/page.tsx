'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email || !password || loading) return

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  const valid = email.trim().includes('@') && password.length >= 6

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary/70">
            Jullia Mothé Tattoo
          </p>

          <h1 className="font-serif text-3xl text-foreground">
            Painel administrativo
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Entre com sua conta para gerenciar horários e reservas.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!valid || loading}
            className={`mt-2 w-full rounded-lg px-5 py-3.5 text-sm font-medium uppercase tracking-widest transition-all ${
              valid && !loading
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'cursor-not-allowed bg-secondary text-muted-foreground opacity-70'
            }`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
