const API_URL = 'https://api.mercadopago.com/v1/orders'

function token() {
  const value = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!value) throw new Error('Access Token do Mercado Pago ausente.')
  return value
}

export async function createPixOrder(input: {
  reservationId: number
  email: string
  firstName: string
}) {
  const testMode = process.env.MERCADO_PAGO_TEST_MODE !== 'false'
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      type: 'online',
      total_amount: '50.00',
      external_reference: String(input.reservationId),
      processing_mode: 'automatic',
      payer: {
        email: input.email,
        first_name: testMode ? 'APRO' : input.firstName,
      },
      transactions: {
        payments: [
          {
            amount: '50.00',
            payment_method: { id: 'pix', type: 'bank_transfer' },
            expiration_time: 'PT30M',
          },
        ],
      },
    }),
    cache: 'no-store',
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.message ?? 'Mercado Pago recusou a criação do Pix.')
  }
  return data
}

export async function getPixOrder(orderId: string) {
  const response = await fetch(`${API_URL}/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Não foi possível consultar o Pix.')
  return response.json()
}

export async function cancelPixOrder(orderId: string) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(orderId)}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
      },
      cache: 'no-store',
    },
  )
  if (!response.ok && response.status !== 409) {
    throw new Error('Não foi possível cancelar a order do Pix.')
  }
}

export function isPaidOrder(order: any) {
  const payment = order?.transactions?.payments?.[0]
  return (
    ['approved', 'processed'].includes(order?.status) ||
    ['approved', 'processed', 'accredited'].includes(payment?.status)
  )
}
