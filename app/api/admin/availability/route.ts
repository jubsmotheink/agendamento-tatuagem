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
    .select('id, data, horario, ativo')
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
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { date, time } = await request.json()

  if (!date || !time) {
    return NextResponse.json(
      { error: 'Informe data e horário.' },
      { status: 400 },
    )
  }

  const supabase = createSupabaseAdmin()

  const { data: existing } = await supabase
    .from('horarios_disponiveis')
    .select('id')
    .eq('data', date)
    .eq('horario', time)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('horarios_disponiveis')
      .update({ ativo: true })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json(
        { error: 'Não foi possível reativar o horário.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase
    .from('horarios_disponiveis')
    .insert({
      data: date,
      horario: time,
      ativo: true,
    })

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível adicionar o horário.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { id, ativo } = await request.json()

  if (!id || typeof ativo !== 'boolean') {
    return NextResponse.json(
      { error: 'Dados inválidos.' },
      { status: 400 },
    )
  }

  const supabase = createSupabaseAdmin()

  const { error } = await supabase
    .from('horarios_disponiveis')
    .update({ ativo })
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: 'Não foi possível alterar o horário.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
