import { NextResponse } from 'next/server'
import { cancelPixOrder } from '@/lib/mercado-pago'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
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

  if (!data || data.status === 'confirmado') {
    return NextResponse.json({ ok: true })
  }

  if (data.mercado_pago_order_id) {
    await cancelPixOrder(data.mercado_pago_order_id).catch(() => undefined)
  }
  await supabase
    .from('agendamentos')
    .update({ status: 'expirado', pagamento_status: 'expirado' })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
