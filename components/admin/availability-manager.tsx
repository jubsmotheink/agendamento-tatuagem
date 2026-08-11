'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Availability = {
  id: number
  data: string
  horario: string
  ativo: boolean
  bloqueado: boolean
}

const DEFAULT_TIMES = ['10:00', '14:00', '17:00']

export function AvailabilityManager() {
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString('en-CA'),
  )
  const [customTime, setCustomTime] = useState('')
  const [items, setItems] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAvailability()
  }, [])

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token ?? null
  }

  async function loadAvailability() {
    setLoading(true)
    setError('')

    const token = await getAccessToken()

    if (!token) {
      setError('Sessão expirada. Entre novamente no painel.')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/availability', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ?? 'Não foi possível carregar os horários.',
        )
      }

      setItems(result.availability ?? [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os horários.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function addTime(time: string) {
    if (!date || !time || saving) return

    setSaving(true)
    setError('')

    const token = await getAccessToken()

    if (!token) {
      setError('Sessão expirada. Entre novamente no painel.')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          time,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ?? 'Não foi possível adicionar o horário.',
        )
      }

      setCustomTime('')
      await loadAvailability()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível adicionar o horário.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailability(item: Availability) {
    setSaving(true)
    setError('')

    const token = await getAccessToken()

    if (!token) {
      setError('Sessão expirada. Entre novamente no painel.')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          ativo: !item.ativo,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ?? 'Não foi possível alterar o horário.',
        )
      }

      await loadAvailability()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível alterar o horário.',
      )
    } finally {
      setSaving(false)
    }
  }
async function toggleBlocked(item: Availability) {
  setSaving(true)
  setError('')

  const token = await getAccessToken()

  if (!token) {
    setError('Sessão expirada. Entre novamente no painel.')
    setSaving(false)
    return
  }

  try {
    const response = await fetch('/api/admin/availability', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: item.id,
        bloqueado: !item.bloqueado,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error ?? 'Não foi possível alterar o bloqueio.',
      )
    }

    await loadAvailability()
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Não foi possível alterar o bloqueio.',
    )
  } finally {
    setSaving(false)
  }
}
  const selectedItems = useMemo(
    () =>
      items
        .filter((item) => item.data === date)
        .sort((a, b) => a.horario.localeCompare(b.horario)),
    [items, date],
  )

  function alreadyExists(time: string) {
    return selectedItems.some(
      (item) => item.horario.slice(0, 5) === time && item.ativo,
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">
          Data
        </label>

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground sm:max-w-xs"
        />

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Horários padrão
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {DEFAULT_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                disabled={saving || alreadyExists(time)}
                onClick={() => addTime(time)}
                className={`rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  alreadyExists(time)
                    ? 'cursor-not-allowed border-border bg-secondary text-muted-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Horário excepcional
          </p>

          <div className="mt-3 flex gap-2">
            <input
              type="time"
              value={customTime}
              onChange={(event) => setCustomTime(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground"
            />

            <button
              type="button"
              disabled={!customTime || saving}
              onClick={() => addTime(customTime)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-50"
            >
              <Plus className="size-4" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Horários desta data
          </p>

          <button
            type="button"
            onClick={loadAvailability}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </button>
        </div>

        {error && (
          <p className="mb-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && selectedItems.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Nenhum horário aberto nesta data.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4"
            >
              <div>
                <p className="font-serif text-lg text-foreground">
                  {item.horario.slice(0, 5)}
                </p>

               <p className="mt-0.5 text-xs text-muted-foreground">
  {!item.ativo
    ? 'Oculto'
    : item.bloqueado
      ? 'Bloqueado'
      : 'Disponível'}
</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
  {item.ativo && (
    <button
      type="button"
      disabled={saving}
      onClick={() => toggleBlocked(item)}
      className="rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground"
    >
      {item.bloqueado ? 'Desbloquear' : 'Bloquear'}
    </button>
  )}

  <button
    type="button"
    disabled={saving}
    onClick={() => toggleAvailability(item)}
    className={`rounded-lg px-3 py-2 text-xs uppercase tracking-widest ${
      item.ativo
        ? 'border border-destructive/30 text-destructive'
        : 'bg-primary text-primary-foreground'
    }`}
  >
    {item.ativo ? 'Ocultar' : 'Reativar'}
  </button>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
