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
      <label
        htmlFor="studio-location"
        className="mb-3 block text-xs uppercase tracking-widest text-muted-foreground"
      >
        Escolha sua unidade
      </label>
      <select
        id="studio-location"
        value={selected ?? ''}
        onChange={(event) =>
          onSelect(event.target.value as StudioLocationId)
        }
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-ring"
      >
        <option value="" disabled>
          Selecione uma unidade
        </option>
        {STUDIO_LOCATIONS.map((location) => {
          return (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          )
        })}
      </select>
    </div>
  )
}
