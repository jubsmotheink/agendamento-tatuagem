import { NextResponse } from 'next/server'
import { createPixOrder } from '@/lib/mercado-pago'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  let reservationId: number | null = null

  try {
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    const whatsapp = String(body.whatsapp ?? '').trim()
    const email = String(body.email ?? '').trim().toLowerCase()
    const date = String(body.date ?? '')
    const time = String(body.time ?? '')

    if (!name || !whatsapp || !email.includes('@') || !date || !time) {
      return NextResponse.json({ error: 'Dados da reserva incompletos.' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    const supabase = createSupabaseAdmin()
    const { data: reservation, error } = await supabase
      .from('agendamentos')
      .insert({
        nome: name,
        telefone: whatsapp,
        email,
        data: date,
        horario: time,
        status: 'pendente',
        pagamento_status: 'aguardando',
        expires_at: expiresAt,
      })
      .select('id')
      .single()

    if (error || !reservation) {
      throw new Error(error?.message ?? 'Não foi possível reservar o horário.')
    }
    reservationId = reservation.id

    const order = await createPixOrder({
      reservationId: reservation.id,
      email,
      firstName: name.split(/\s+/)[0],
    })
    const payment = order.transactions?.payments?.[0]

    await supabase
      .from('agendamentos')
      .update({ mercado_pago_order_id: order.id })
      .eq('id', reservationId)

    return NextResponse.json({
      reservationId,
      expiresAt,
      orderId: order.id,
      qrCode: payment?.payment_method?.qr_code ?? null,
      qrCodeBase64: payment?.payment_method?.qr_code_base64 ?? null,
      ticketUrl: payment?.payment_method?.ticket_url ?? null,
    })
  } catch (error) {
    if (reservationId) {
      const supabase = createSupabaseAdmin()
      await supabase.from('agendamentos').delete().eq('id', reservationId)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao gerar o Pix.' },
      { status: 500 },
    )
  }
}
