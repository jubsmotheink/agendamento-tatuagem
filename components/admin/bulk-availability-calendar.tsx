'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const DEFAULT_TIMES = ['10:00', '14:00', '17:00']
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

type BulkAvailabilityCalendarProps = {
  onSaved?: () => void | Promise<void>
}

export function BulkAvailabilityCalendar({
  onSaved,
}: BulkAvailabilityCalendarProps) {
  const today = startOfDay(new Date())

  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedTimes, setSelectedTimes] = useState<string[]>([
    '10:00',
    '14:00',
    '17:00',
  ])

  const [customTime, setCustomTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const calendarDays = useMemo(
    () => buildCalendarDays(viewMonth),
    [viewMonth],
  )

  function toggleDate(date: Date) {
    if (date < today) return

    const key = dateKey(date)

    setSelectedDates((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }

  function selectWholeMonth() {
    const dates = calendarDays
      .filter(
        (item) =>
          item.inMonth &&
          item.date >= today,
      )
      .map((item) => dateKey(item.date))

    setSelectedDates(dates)
  }

  function toggleTime(time: string) {
    setSelectedTimes((current) =>
      current.includes(time)
        ? current.filter((item) => item !== time)
        : [...current, time],
    )
  }

  function addCustomTime() {
    if (!customTime) return

    setSelectedTimes((current) =>
      current.includes(customTime)
        ? current
        : [...current, customTime].sort(),
    )

    setCustomTime('')
  }

  async function saveBulkAvailability() {
    if (
      selectedDates.length === 0 ||
      selectedTimes.length === 0 ||
      saving
    ) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setError('Sessão expirada. Entre novamente no painel.')
      setSaving(false)
      return
    }

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dates: selectedDates,
          times: selectedTimes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ??
            'Não foi possível abrir os horários.',
        )
      }

      setMessage(
        `${selectedDates.length} ${
          selectedDates.length === 1 ? 'data aberta' : 'datas abertas'
        } com sucesso.`,
      )

      setSelectedDates([])

      await onSaved?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível abrir os horários.',
      )
    } finally {
      setSaving(false)
    }
  }

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(viewMonth)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Abertura em lote
        </p>

        <h3 className="mt-1 font-serif text-xl text-foreground">
          Selecione várias datas
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Escolha os dias e depois os horários que deseja abrir.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setViewMonth((current) =>
              addMonths(current, -1),
            )
          }
          className="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
        >
          <ChevronLeft className="size-4" />
        </button>

        <p className="font-serif text-lg capitalize text-foreground">
          {monthLabel}
        </p>

        <button
          type="button"
          onClick={() =>
            setViewMonth((current) =>
              addMonths(current, 1),
            )
          }
          className="flex size-9 items-center justify-center rounded-full hover:bg-secondary"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {calendarDays.map(({ date, inMonth }) => {
          const key = dateKey(date)
          const selected = selectedDates.includes(key)
          const past = date < today

          return (
            <div
              key={key}
              className="flex items-center justify-center"
            >
              {!inMonth ? (
                <span className="size-10" />
              ) : (
                <button
                  type="button"
                  disabled={past}
                  onClick={() => toggleDate(date)}
                  className={`flex size-10 items-center justify-center rounded-full text-sm transition-all ${
                    past
                      ? 'cursor-not-allowed text-muted-foreground/30'
                      : selected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {date.getDate()}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={selectWholeMonth}
          className="rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground"
        >
          Selecionar mês
        </button>

        <button
          type="button"
          onClick={() => setSelectedDates([])}
          className="rounded-lg border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground"
        >
          Limpar seleção
        </button>
      </div>

      <div className="mt-7 border-t border-border pt-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Horários
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {DEFAULT_TIMES.map((time) => {
            const selected = selectedTimes.includes(time)

            return (
              <button
                key={time}
                type="button"
                onClick={() => toggleTime(time)}
                className={`rounded-lg border px-4 py-2.5 text-sm ${
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground'
                }`}
              >
                {time}
              </button>
            )
          })}

          {selectedTimes
            .filter((time) => !DEFAULT_TIMES.includes(time))
            .map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => toggleTime(time)}
                className="rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm text-primary-foreground"
              >
                {time}
              </button>
            ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="time"
            value={customTime}
            onChange={(event) =>
              setCustomTime(event.target.value)
            }
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm"
          />

          <button
            type="button"
            disabled={!customTime}
            onClick={addCustomTime}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-3 text-xs uppercase tracking-widest disabled:opacity-40"
          >
            <Plus className="size-4" />
            Horário
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm text-muted-foreground">
          {selectedDates.length} datas selecionadas ·{' '}
          {selectedTimes.length} horários
        </p>

        {error && (
          <p className="mb-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-3 text-sm text-foreground">
            {message}
          </p>
        )}

        <button
          type="button"
          disabled={
            selectedDates.length === 0 ||
            selectedTimes.length === 0 ||
            saving
          }
          onClick={saveBulkAvailability}
          className="w-full rounded-lg bg-primary px-5 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving
            ? 'Abrindo agenda...'
            : 'Abrir horários nas datas selecionadas'}
        </button>
      </div>
    </div>
  )
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  )
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addMonths(date: Date, amount: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
  )
}

function buildCalendarDays(month: Date) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()

  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)

  const result: {
    date: Date
    inMonth: boolean
  }[] = []

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const date = new Date(year, monthIndex, 1 - (firstDay.getDay() - i))

    result.push({
      date,
      inMonth: false,
    })
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    result.push({
      date: new Date(year, monthIndex, day),
      inMonth: true,
    })
  }

  while (result.length % 7 !== 0) {
    const last = result[result.length - 1].date

    result.push({
      date: new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate() + 1,
      ),
      inMonth: false,
    })
  }

  return result
}
