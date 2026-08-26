import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')?.trim()

  if (!date) {
    return NextResponse.json(
      { error: 'Informe uma data.' },
      { status: 400, headers: NO_STORE_HEADERS },
    )
  }

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('horarios_disponiveis')
    .select('horario, bloqueado')
    .eq('data', date)
    .eq('ativo', true)
    .order('horario')

  if (error) {
    console.error('Erro ao buscar disponibilidade:', error)

    return NextResponse.json(
      { error: 'Não foi possível carregar os horários.' },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }

 return NextResponse.json({
 times: (data ?? []).map((item) => ({
    time: item.horario.slice(0, 5),
    blocked: item.bloqueado,
  })),
}, { headers: NO_STORE_HEADERS })
}
