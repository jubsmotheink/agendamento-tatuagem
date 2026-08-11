import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const year = Number(searchParams.get('year'))
  const month = Number(searchParams.get('month'))

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: 'Mês inválido.' },
      { status: 400 },
    )
  }

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`

  const nextMonth =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const supabase = createSupabaseAdmin()

  const { data: availability, error: availabilityError } = await supabase
    .from('horarios_disponiveis')
    .select('data, horario, ativo, bloqueado')
    .gte('data', firstDay)
    .lt('data', nextMonth)

  if (availabilityError) {
    return NextResponse.json(
      { error: 'Não foi possível carregar o calendário.' },
      { status: 500 },
    )
  }

  const { data: reservations, error: reservationsError } = await supabase
    .from('agendamentos')
    .select('data, horario, status')
    .gte('data', firstDay)
    .lt('data', nextMonth)
    .in('status', ['pendente', 'confirmado'])

  if (reservationsError) {
    return NextResponse.json(
      { error: 'Não foi possível carregar as reservas.' },
      { status: 500 },
    )
  }

  const booked = new Set(
    (reservations ?? []).map(
      (item) =>
        `${String(item.data).slice(0, 10)}|${String(item.horario).slice(0, 5)}`,
    ),
  )

  const byDate = new Map<string, boolean>()

  for (const item of availability ?? []) {
    const date = String(item.data).slice(0, 10)
    const time = String(item.horario).slice(0, 5)

    const hasFreeSlot =
      item.ativo &&
      !item.bloqueado &&
      !booked.has(`${date}|${time}`)

    if (!byDate.has(date)) {
      byDate.set(date, false)
    }

    if (hasFreeSlot) {
      byDate.set(date, true)
    }
  }

 const availableDates = [...byDate.entries()]
  .filter(([, hasFreeSlot]) => hasFreeSlot)
  .map(([date]) => date)

return NextResponse.json({
  availableDates,
})
}
