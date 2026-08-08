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
  expiresAt: string | null
}

export const initialBookingState: BookingState = {
  date: null,
  time: null,
  name: '',
  whatsapp: '',
  expiresAt: null,
}
