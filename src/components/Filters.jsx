import { FOOD_TYPES } from '../constants'

const TIME_OPTIONS = [
  { value: '', label: 'Alle tider' },
  { value: '15', label: 'Under 15 min' },
  { value: '30', label: 'Under 30 min' },
  { value: '60', label: 'Under 60 min' },
  { value: '60+', label: '60 min eller mer' },
]

export default function Filters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  category,
  onCategoryChange,
  categories,
  maxTime,
  onMaxTimeChange,
}) {
  return (
    <div className="filters-bar">
      <input
        type="search"
        className="filters-search"
        placeholder="Søk etter oppskrift..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select value={type} onChange={(e) => onTypeChange(e.target.value)}>
        <option value="">Alle typer</option>
        {FOOD_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
        <option value="">Alle kategorier</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select value={maxTime} onChange={(e) => onMaxTimeChange(e.target.value)}>
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
