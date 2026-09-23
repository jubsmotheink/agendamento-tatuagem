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

export const STUDIO_LOCATIONS = [
  {
    id: 'barra-guaratiba',
    name: 'Barra de Guaratiba',
    address:
      'Estr. Roberto Burle Marx, 8624, Barra de Guaratiba, Rio de Janeiro - RJ, 23020-265',
    hint: 'Unidade Barra de Guaratiba',
    mapsUrl:
      'https://www.google.com/maps/place/Estr.+Roberto+Burle+Marx,+8624+-+Guaratiba,+Rio+de+Janeiro+-+RJ,+23020-265/@-23.0591765,-43.5624603,17z/data=!3m1!4b1!4m6!3m5!1s0x9beeaafd24c2c3:0xdc14521430cde24a!8m2!3d-23.0591765!4d-43.5624603!16s%2Fg%2F11c1796ckf?entry=ttu',
  },
  {
    id: 'copacabana-barata-ribeiro',
    name: 'Copacabana — Unidade Barata Ribeiro',
    address:
      'R. Barata Ribeiro, 759, Copacabana, Rio de Janeiro - RJ, 22051-001',
    hint: 'Próximo ao metrô Cantagalo',
    mapsUrl:
      'https://www.google.com/maps/place/R.+Barata+Ribeiro,+759+-+Copacabana,+Rio+de+Janeiro+-+RJ,+22051-001/@-22.978029,-43.1933329,17z/data=!4m6!3m5!1s0x9bd5404554d625:0xb00667d654f32113!8m2!3d-22.9760153!4d-43.1922721!16s%2Fg%2F11nnv0mxpt?entry=ttu',
  },
  {
    id: 'copacabana-djalma-ulrich',
    name: 'Copacabana — Unidade Djalma Ulrich',
    address:
      'R. Djalma Ulrich, 163, loja E, Copacabana, Rio de Janeiro - RJ, 22071-020',
    hint: 'Próximo ao Posto 5',
    mapsUrl:
      'https://www.google.com/maps/place/Rua+Djalma+Ulrich,+163%2F301+-+Copacabana,+Rio+de+Janeiro+-+RJ,+22071-020/@-22.9779829,-43.193088,17z/data=!4m6!3m5!1s0x9bd53f7056aaab:0x4613b656eb783fed!8m2!3d-22.9788815!4d-43.1911924!16s%2Fg%2F11yjgblp59?entry=ttu',
  },
] as const

export type StudioLocationId = (typeof STUDIO_LOCATIONS)[number]['id']

export function getStudioLocation(id: string | null | undefined) {
  return STUDIO_LOCATIONS.find((location) => location.id === id)
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
export function buildWhatsappLink(
  dateLabel: string,
  timeLabel: string,
  locationName: string,
): string {
  const message = `Oi! Acabei de realizar meu agendamento para o dia ${dateLabel} às ${timeLabel}, na unidade ${locationName}. `
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
