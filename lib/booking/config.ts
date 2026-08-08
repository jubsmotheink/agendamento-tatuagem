/**
 * Configuração central do agendamento.
 *
 * Este arquivo concentra as regras de negócio para facilitar a evolução
 * futura do projeto. Quando adicionarmos banco de dados, painel administrativo
 * (para a Jullia cadastrar seus dias e horários), reserva temporária de 15
 * minutos, sinal de R$50 via Pix, confirmação automática do pagamento e
 * bloqueio do horário, os horários disponíveis passarão a vir do servidor —
 * bastará substituir `getAvailableTimes` por uma consulta real mantendo a
 * mesma assinatura.
 */

export type TimeSlot = {
  /** Valor em formato 24h, usado como identificador estável (ex.: "14:00"). */
  value: string
  /** Rótulo exibido ao cliente (ex.: "14h"). */
  label: string
}

/** Nome do estúdio, centralizado para reuso. */
export const STUDIO_NAME = 'Jullia Mothé Tattoo'

/** Assinatura / @ da marca, exibida de forma discreta acima do nome. */
export const STUDIO_HANDLE = '@jubsmotheink'

/**
 * WhatsApp do estúdio no formato internacional apenas com dígitos
 * (55 + DDD + número).
 */
export const STUDIO_WHATSAPP = '5521997500978'

/**
 * Monta o link wa.me com a mensagem pré-preenchida do agendamento.
 * Funciona tanto no celular (abre o app) quanto no computador (abre o
 * WhatsApp Web / desktop).
 */
export function buildWhatsappLink(dateLabel: string, timeLabel: string): string {
  const message = `Oi! Acabei de realizar meu agendamento para o dia ${dateLabel} às ${timeLabel}. `
  return `https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(message)}`
}

/** Horários fixos oferecidos pelo estúdio. */
export const STUDIO_TIME_SLOTS: TimeSlot[] = [
  { value: '10:00', label: '10h' },
  { value: '14:00', label: '14h' },
  { value: '17:00', label: '17h' },
]

/**
 * Valor do sinal (em reais) que futuramente será cobrado via Pix.
 * Mantido aqui para uso posterior — ainda não é exibido na V1.
 */
export const DEPOSIT_AMOUNT = 50

/**
 * Retorna os horários disponíveis para uma data.
 *
 * Por enquanto todos os horários estão sempre livres (sem banco de dados).
 * No futuro, esta função consultará as reservas confirmadas e as reservas
 * temporárias (janela de 15 minutos) para remover horários ocupados.
 */
export function getAvailableTimes(_date: Date): TimeSlot[] {
  return STUDIO_TIME_SLOTS
}
