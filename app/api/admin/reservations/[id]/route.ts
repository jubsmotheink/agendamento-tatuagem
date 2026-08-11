import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

async function getAdminUser(request: Request) {
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  const accessToken = authorization.slice(7)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return null
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return null
  }

  return user
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Não autorizado.' },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const reservationId = Number(id)

  if (!Number.isInteger(reservationId)) {
    return NextResponse.json(
      { error: 'Reserva inválida.' },
      { status: 400 },
    )
  }

  const body = await request.json()
  const action = String(body.action ?? '')
  const supabase = createSupabaseAdmin()

  const { data: reservation, error: reservationError } = await supabase
    .from('agendamentos')
    .select('id, status, pagamento_status, data, horario')
    .eq('id', reservationId)
    .single()

  if (reservationError || !reservation) {
    return NextResponse.json(
      { error: 'Reserva não encontrada.' },
      { status: 404 },
    )
  }
if (action === 'archive') {
  const { error } = await supabase
    .from('agendamentos')
    .update({
      arquivado: true,
    })
    .eq('id', reservationId)

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível arquivar a reserva.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
  if (action === 'cancel') {
    if (reservation.status === 'cancelado') {
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase
      .from('agendamentos')
      .update({
        status: 'cancelado',
      })
      .eq('id', reservationId)

    if (error) {
      return NextResponse.json(
        { error: 'Não foi possível cancelar a reserva.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  }

  if (action === 'reschedule') {
    const date = String(body.date ?? '').trim()
    const time = String(body.time ?? '').trim()

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Informe a nova data e horário.' },
        { status: 400 },
      )
    }

    const { data: conflict } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', date)
      .eq('horario', time)
      .in('status', ['pendente', 'confirmado'])
      .neq('id', reservationId)
      .limit(1)
      .maybeSingle()

    if (conflict) {
      return NextResponse.json(
        { error: 'Esse horário já possui uma reserva ativa.' },
        { status: 409 },
      )
    }

    const { error } = await supabase
      .from('agendamentos')
      .update({
        data: date,
        horario: time,
      })
      .eq('id', reservationId)

    if (error) {
      return NextResponse.json(
        { error: 'Não foi possível reagendar a reserva.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json(
    { error: 'Ação inválida.' },
    { status: 400 },
  )
}
