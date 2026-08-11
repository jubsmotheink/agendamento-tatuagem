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
    const date = String(body.date ?? '').slice(0, 10)
    const time = String(body.time ?? '').slice(0, 5)

    if (
      !name ||
      !whatsapp ||
      !email.includes('@') ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        { error: 'Dados da reserva incompletos.' },
        { status: 400 },
      )
    }

    const supabase = createSupabaseAdmin()

    const { data: availability, error: availabilityError } =
      await supabase
        .from('horarios_disponiveis')
        .select('id, ativo, bloqueado')
        .eq('data', date)
        .eq('horario', time)
        .maybeSingle()

    if (availabilityError) {
      throw new Error(
        'Não foi possível verificar a disponibilidade.',
      )
    }

    if (
      !availability ||
      !availability.ativo ||
      availability.bloqueado
    ) {
      return NextResponse.json(
        {
          error:
            'Este horário não está mais disponível. Escolha outro horário.',
        },
        { status: 409 },
      )
    }

    const { data: existingReservation } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', date)
      .eq('horario', time)
      .in('status', ['pendente', 'confirmado'])
      .limit(1)
      .maybeSingle()

    if (existingReservation) {
      return NextResponse.json(
        {
          error:
            'Este horário acabou de ser reservado. Escolha outro horário.',
        },
        { status: 409 },
      )
    }

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000,
    ).toISOString()

    const { data: reservation, error: insertError } =
      await supabase
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

    if (insertError || !reservation) {
      if (insertError?.code === '23505') {
        return NextResponse.json(
          {
            error:
              'Este horário acabou de ser reservado. Escolha outro horário.',
          },
          { status: 409 },
        )
      }

      throw new Error(
        insertError?.message ??
          'Não foi possível reservar o horário.',
      )
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
      .update({
        mercado_pago_order_id: order.id,
      })
      .eq('id', reservationId)

    return NextResponse.json({
      reservationId,
      expiresAt,
      orderId: order.id,
      qrCode:
        payment?.payment_method?.qr_code ?? null,
      qrCodeBase64:
        payment?.payment_method?.qr_code_base64 ?? null,
      ticketUrl:
        payment?.payment_method?.ticket_url ?? null,
    })
  } catch (error) {
    if (reservationId) {
      const supabase = createSupabaseAdmin()

      await supabase
        .from('agendamentos')
        .delete()
        .eq('id', reservationId)
    }

    console.error('Erro ao criar reserva:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao gerar o Pix.',
      },
      { status: 500 },
    )
  }
}
