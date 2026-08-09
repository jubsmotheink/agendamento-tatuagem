import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getPixOrder, isPaidOrder } from '@/lib/mercado-pago'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

function isValidSignature(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim()
  const signature = request.headers.get('x-signature')
  const requestId = request.headers.get('x-request-id')

  if (!secret || !signature) return false

  const values = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, rest.join('=')]
    }),
  )

  if (!values.ts || !values.v1) return false

  const received = values.v1.trim().toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(received)) return false

  const receivedBuffer = Buffer.from(received, 'hex')
  const ids = [...new Set([dataId.toLowerCase(), dataId])]
  const requestIds = requestId ? [requestId, null] : [null]

  return ids.some((id) =>
    requestIds.some((candidateRequestId) => {
      let manifest = `id:${id};`
      if (candidateRequestId) {
        manifest += `request-id:${candidateRequestId};`
      }
      manifest += `ts:${values.ts};`

      const expected = createHmac('sha256', secret)
        .update(manifest)
        .digest()

      return (
        receivedBuffer.length === expected.length &&
        timingSafeEqual(receivedBuffer, expected)
      )
    }),
  )
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const dataId = url.searchParams.get('data.id')
    const type = url.searchParams.get('type')

    if (!dataId || type !== 'order') {
      return NextResponse.json({ ok: true })
    }

    if (!isValidSignature(request, dataId)) {
      return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 401 })
    }

    const order = await getPixOrder(dataId)
    const reservationId = String(order?.external_reference ?? '')

    if (!reservationId) {
      return NextResponse.json({ ok: true })
    }

    const supabase = createSupabaseAdmin()

    if (isPaidOrder(order)) {
      await supabase
        .from('agendamentos')
        .update({ status: 'confirmado', pagamento_status: 'aprovado' })
        .eq('id', reservationId)
        .eq('mercado_pago_order_id', dataId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error)
    return NextResponse.json({ error: 'Erro ao processar notificação.' }, { status: 500 })
  }
}
