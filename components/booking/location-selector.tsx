import { Check, MapPin } from 'lucide-react'
import {
  STUDIO_LOCATIONS,
  type StudioLocationId,
} from '@/lib/booking/config'

type LocationSelectorProps = {
  selected: StudioLocationId | null
  onSelect: (locationId: StudioLocationId) => void
}

export function LocationSelector({
  selected,
  onSelect,
}: LocationSelectorProps) {
  return (
    <div className="mb-7">
      <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
        Escolha sua unidade
      </p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Unidade de atendimento">
        {STUDIO_LOCATIONS.map((location) => {
          const isSelected = selected === location.id

          return (
            <button
              key={location.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(location.id)}
              className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                isSelected
                  ? 'border-accent bg-accent/15 text-foreground shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-accent/50 hover:bg-secondary/40'
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                }`}
              >
                <MapPin className="size-4" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="flex-1 font-serif text-base leading-snug">
                {location.name}
              </span>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border bg-background'
                }`}
                aria-hidden="true"
              >
                {isSelected ? <Check className="size-3" strokeWidth={2} /> : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
