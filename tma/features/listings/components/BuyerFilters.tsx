import {
  DEFAULT_MAX_PRICE,
  FUEL_FILTER_OPTIONS,
  MAX_PRICE,
  MIN_PRICE,
  PRICE_STEP,
} from '../constants';

interface BuyerFiltersProps {
  fuelFilter: string;
  maxPrice: number;
  onFuelFilterChange: (value: string) => void;
  onMaxPriceChange: (value: number) => void;
}

export function BuyerFilters({
  fuelFilter,
  maxPrice = DEFAULT_MAX_PRICE,
  onFuelFilterChange,
  onMaxPriceChange,
}: BuyerFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3 rounded-3xl bg-gray-900 p-4">
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-xs text-gray-400">Max Price</label>
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          value={maxPrice}
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="mt-1 text-sm font-medium text-emerald-400">≤ {maxPrice.toLocaleString()} ETB</div>
      </div>

      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-xs text-gray-400">Fuel Type</label>
        <select
          value={fuelFilter}
          onChange={(event) => onFuelFilterChange(event.target.value)}
          className="w-full rounded-2xl bg-gray-800 px-4 py-3 text-sm text-white"
        >
          {FUEL_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
