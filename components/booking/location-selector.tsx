'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, MapPin } from 'lucide-react'
import {
  getStudioLocation,
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
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLocation = getStudioLocation(selected)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function selectLocation(locationId: StudioLocationId) {
    onSelect(locationId)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative z-20 mb-7">
      <label
        id="studio-location-label"
        className="mb-3 block text-xs uppercase tracking-widest text-muted-foreground"
      >
        Escolha sua unidade
      </label>

      <button
        type="button"
        aria-labelledby="studio-location-label studio-location-value"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="studio-location-options"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isOpen ? 'border-accent ring-1 ring-accent/20' : 'border-border hover:border-accent/50'
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <MapPin className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span
          id="studio-location-value"
          className={`flex-1 font-serif text-base leading-snug ${
            selectedLocation ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {selectedLocation?.name ?? 'Selecione uma unidade'}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id="studio-location-options"
          role="listbox"
          aria-labelledby="studio-location-label"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-200"
        >
          {STUDIO_LOCATIONS.map((location) => {
            const isSelected = selected === location.id

            return (
              <button
                key={location.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectLocation(location.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  isSelected
                    ? 'bg-accent/15 text-foreground'
                    : 'text-foreground hover:bg-secondary/60'
                }`}
              >
                <MapPin
                  className={`size-4 shrink-0 ${
                    isSelected ? 'text-accent' : 'text-muted-foreground'
                  }`}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="flex-1 font-serif text-sm leading-snug">
                  {location.name}
                </span>
                {isSelected ? (
                  <Check className="size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden="true" />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
