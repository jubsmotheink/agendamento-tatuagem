import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

async function isAdmin(request: Request) {
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) return false

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const {
    data: { user },
  } = await supabase.auth.getUser(authorization.slice(7))

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  return !!user && !!adminEmail && user.email?.toLowerCase() === adminEmail
}

export async function GET(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('horarios_disponiveis')
    .select('id, data, horario, ativo, bloqueado')
    .order('data')
    .order('horario')

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível carregar os horários.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ availability: data ?? [] })
}

export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json(
      { error: 'Não autorizado.' },
      { status: 401 },
    )
  }

  const body = await request.json()

  const dates = Array.isArray(body.dates)
    ? body.dates
    : body.date
      ? [body.date]
      : []

  const times = Array.isArray(body.times)
    ? body.times
    : body.time
      ? [body.time]
      : []

  if (dates.length === 0 || times.length === 0) {
    return NextResponse.json(
      { error: 'Informe pelo menos uma data e um horário.' },
      { status: 400 },
    )
  }

  const supabase = createSupabaseAdmin()

  const rows = dates.flatMap((date: string) =>
    times.map((time: string) => ({
      data: date,
      horario: time,
      ativo: true,
      bloqueado: false,
    })),
  )

  const { error } = await supabase
    .from('horarios_disponiveis')
    .upsert(rows, {
      onConflict: 'data,horario',
    })

  if (error) {
    console.error('Erro ao adicionar horários em lote:', error)

    return NextResponse.json(
      { error: 'Não foi possível adicionar os horários.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    created: rows.length,
  })
}

export async function PATCH(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id, ativo, bloqueado } = await request.json()

if (
  !id ||
  (typeof ativo !== 'boolean' && typeof bloqueado !== 'boolean')
) {
  return NextResponse.json(
    { error: 'Dados inválidos.' },
    { status: 400 },
  )
}

const supabase = createSupabaseAdmin()

const updates: {
  ativo?: boolean
  bloqueado?: boolean
} = {}

if (typeof ativo === 'boolean') {
  updates.ativo = ativo
}

if (typeof bloqueado === 'boolean') {
  updates.bloqueado = bloqueado
}

const { error } = await supabase
  .from('horarios_disponiveis')
  .update(updates)
  .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível alterar o horário.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
