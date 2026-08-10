'use client'

import { useState } from 'react'

/** Aplica máscara de WhatsApp brasileiro: (11) 98765-4321 */
function maskWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1')
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, '($1) $2')
  if (digits.length <= 10)
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

/** Considera válido a partir de 10 dígitos (fixo/celular). */
function isValidWhatsApp(value: string): boolean {
  return value.replace(/\D/g, '').length >= 10
}

type ContactFormProps = {
  name: string
  whatsapp: string
  email: string
  onSubmit: (data: { name: string; whatsapp: string; email: string }) => void
}

export function ContactForm({ name, whatsapp, email, onSubmit }: ContactFormProps) {
  const [nameValue, setNameValue] = useState(name)
  const [whatsappValue, setWhatsappValue] = useState(whatsapp)
  const [emailValue, setEmailValue] = useState(email)
  const [touched, setTouched] = useState(false)

  const nameOk = nameValue.trim().length >= 2
  const whatsappOk = isValidWhatsApp(whatsappValue)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())
  const valid = nameOk && whatsappOk && emailOk

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    onSubmit({
      name: nameValue.trim(),
      whatsapp: whatsappValue,
      email: emailValue.trim().toLowerCase(),
    })
  }

  const fieldClass =
    'w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/40'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={emailValue}
          onChange={(e) => setEmailValue(e.target.value)}
          placeholder="voce@exemplo.com"
          className={fieldClass}
        />
        {touched && !emailOk && (
          <span className="text-xs text-destructive">
            Informe um e-mail válido para gerar o Pix.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nome
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          placeholder="Como posso te chamar"
          className={fieldClass}
        />
        {touched && !nameOk && (
          <span className="text-xs text-destructive">
            Informe seu nome para continuar.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={whatsappValue}
          onChange={(e) => setWhatsappValue(maskWhatsApp(e.target.value))}
          placeholder="(11) 98765-4321"
          className={fieldClass}
        />
        {touched && !whatsappOk && (
          <span className="text-xs text-destructive">
            Informe um WhatsApp válido com DDD.
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          Uso apenas para falar com você sobre a sessão.
        </span>
      </div>

      <button
  type="submit"
  disabled={!valid}
  className={`mt-2 w-full rounded-lg px-5 py-3.5 text-sm font-medium uppercase tracking-widest transition-all ${
    valid
      ? 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer'
      : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-70'
  }`}
>
  Revisar reserva
</button>
    </form>
  )
}
