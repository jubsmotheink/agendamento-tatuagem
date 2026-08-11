import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'
import { BookingFlow } from '@/components/booking/booking-flow'

export default function Page() {
  return (
    <main className="relative flex min-h-svh items-start justify-center px-5 py-14 sm:items-center sm:py-20">
      <BookingFlow />

      <Link
        href="/admin"
        aria-label="Acessar painel administrativo"
        className="fixed bottom-4 right-4 flex size-8 items-center justify-center rounded-full text-muted-foreground/35 transition-colors hover:bg-card hover:text-muted-foreground"
      >
        <LockKeyhole className="size-3.5" strokeWidth={1.5} />
      </Link>
    </main>
  )
}
