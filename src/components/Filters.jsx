import Select from './Select'
import { FOOD_TYPES, TAG_OPTIONS } from '../constants'

const TIME_OPTIONS = [
  { value: '', label: 'Alle tider' },
  { value: '15', label: 'Under 15 min' },
  { value: '30', label: 'Under 30 min' },
  { value: '60', label: 'Under 60 min' },
  { value: '60+', label: '60 min eller mer' },
]

const TYPE_OPTIONS = [{ value: '', label: 'Alle typer' }, ...FOOD_TYPES.map((t) => ({ value: t, label: t }))]

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
  tags,
  onToggleTag,
}) {
  const categoryOptions = [
    { value: '', label: 'Alle kategorier' },
    ...categories.map((c) => ({ value: c, label: c })),
  ]

  return (
    <div className="filters">
      <div className="filters-bar">
        <input
          type="search"
          className="filters-search"
          placeholder="Søk etter oppskrift..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <Select options={TYPE_OPTIONS} value={type} onChange={onTypeChange} placeholder="Alle typer" />
        <Select
          options={categoryOptions}
          value={category}
          onChange={onCategoryChange}
          placeholder="Alle kategorier"
        />
        <Select options={TIME_OPTIONS} value={maxTime} onChange={onMaxTimeChange} placeholder="Alle tider" />
      </div>

      <div className="tags-field">
        {TAG_OPTIONS.map((tag) => (
          <label key={tag} className="tag-checkbox">
            <input type="checkbox" checked={tags.includes(tag)} onChange={() => onToggleTag(tag)} />
            {tag}
          </label>
        ))}
      </div>
    </div>
  )
}
