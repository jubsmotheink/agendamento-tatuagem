/**
 * Utilitários de data para o calendário de agendamento.
 * Implementação sem dependências externas para manter o bundle enxuto.
 */

export const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function addMonths(date: Date, amount: number): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setMonth(d.getMonth() + amount)
  return d
}

export function isPast(date: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(new Date()).getTime()
}

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`
}

/** Data por extenso, ex.: "quinta-feira, 12 de junho". */
export function formatLongDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Gera a grade de 6 semanas (42 células) que compõe a visualização do mês,
 * começando no domingo. Células fora do mês corrente vêm com `outside: true`.
 */
export function getCalendarDays(month: Date): { date: Date; outside: boolean }[] {
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay())

  const days: { date: Date; outside: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    days.push({ date, outside: !isSameMonth(date, month) })
  }
  return days
}
