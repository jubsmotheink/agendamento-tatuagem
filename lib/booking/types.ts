/** Etapas do fluxo de agendamento. */
export type BookingStep =
  | 'schedule'
  | 'contact'
  | 'review'
  | 'reservation'
  | 'expired'
  | 'confirmation'

/** Estado acumulado ao longo do fluxo. */
export type BookingState = {
  date: Date | null
  /** Horário no formato 24h, ex.: "14:00". */
  time: string | null
  name: string
  whatsapp: string
  email: string
  expiresAt: string | null
  reservationId: number | null
  pixOrderId: string | null
  pixQrCode: string | null
  pixQrCodeBase64: string | null
  pixTicketUrl: string | null
}

export const initialBookingState: BookingState = {
  date: null,
  time: null,
  name: '',
  whatsapp: '',
  email: '',
  expiresAt: null,
  reservationId: null,
  pixOrderId: null,
  pixQrCode: null,
  pixQrCodeBase64: null,
  pixTicketUrl: null,
}
