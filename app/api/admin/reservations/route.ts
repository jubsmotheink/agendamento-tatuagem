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

export async function GET(request: Request) {
  const user = await getAdminUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Não autorizado.' },
      { status: 401 },
    )
  }

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('agendamentos')
    .select(
      'id, created_at, nome, telefone, email, data, horario, status, pagamento_status',
    )
    .order('data', { ascending: true })
    .order('horario', { ascending: true })

  if (error) {
    console.error('Erro ao carregar reservas:', error)

    return NextResponse.json(
      { error: 'Não foi possível carregar as reservas.' },
      { status: 500 },
    )
  }

  return NextResponse.json({
    reservations: data ?? [],
  })
}
