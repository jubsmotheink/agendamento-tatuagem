'use client'

import { MapPin } from 'lucide-react'
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
    <div className="flex flex-col gap-3">
      {STUDIO_LOCATIONS.map((location) => {
        const isSelected = selected === location.id

        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelect(location.id)}
            aria-pressed={isSelected}
            className={`rounded-xl border px-5 py-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isSelected
                ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                : 'border-border bg-card text-foreground hover:border-accent/50'
            }`}
          >
            <span className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
              <span>
                <span className="block font-serif text-lg">
                  {location.name}
                </span>
                <span
                  className={`mt-1 block text-sm leading-relaxed ${
                    isSelected
                      ? 'text-accent-foreground/75'
                      : 'text-muted-foreground'
                  }`}
                >
                  {location.address}
                </span>
                <span
                  className={`mt-2 block text-xs uppercase tracking-widest ${
                    isSelected
                      ? 'text-accent-foreground/65'
                      : 'text-primary/70'
                  }`}
                >
                  {location.hint}
                </span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
