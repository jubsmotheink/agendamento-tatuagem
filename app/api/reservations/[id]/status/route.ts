import { NextResponse } from 'next/server'
import { getPixOrder, isPaidOrder } from '@/lib/mercado-pago'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('agendamentos')
    .select('status, mercado_pago_order_id')
    .eq('id', id)
    .single()

  if (!data) return NextResponse.json({ error: 'Reserva não encontrada.' }, { status: 404 })
  if (data.status === 'confirmado') return NextResponse.json({ status: 'confirmado' })
  if (!data.mercado_pago_order_id) return NextResponse.json({ status: data.status })

  const order = await getPixOrder(data.mercado_pago_order_id)
  if (isPaidOrder(order)) {
    await supabase
      .from('agendamentos')
      .update({ status: 'confirmado', pagamento_status: 'aprovado' })
      .eq('id', id)
    return NextResponse.json({ status: 'confirmado' })
  }

  return NextResponse.json({ status: 'pendente' })
}
