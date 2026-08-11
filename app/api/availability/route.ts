import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')?.trim()

  if (!date) {
    return NextResponse.json(
      { error: 'Informe uma data.' },
      { status: 400 },
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
      { status: 500 },
    )
  }

 return NextResponse.json({
  times: (data ?? []).map((item) => ({
    time: item.horario.slice(0, 5),
    blocked: item.bloqueado,
  })),
})
}
