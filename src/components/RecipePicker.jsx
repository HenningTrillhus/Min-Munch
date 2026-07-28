import { useMemo, useState } from 'react'
import Modal from './Modal'
import Filters from './Filters'
import RecipeList from './RecipeList'

export default function RecipePicker({ recipes, categories, openIds, onSelect, onDelete, onClose }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [tags, setTags] = useState([])

  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const availableRecipes = useMemo(
    () => recipes.filter((r) => !openIds.includes(r.id)),
    [recipes, openIds]
  )

  const filtered = useMemo(() => {
    return availableRecipes.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      if (type && r.type !== type) return false
      if (category && r.category !== category) return false

      if (maxTime) {
        if (r.prep_time_minutes == null) return false
        if (maxTime === '60+') {
          if (r.prep_time_minutes < 60) return false
        } else if (r.prep_time_minutes >= Number(maxTime)) {
          return false
        }
      }

      if (tags.length > 0 && !tags.some((tag) => r.tags?.includes(tag))) return false

      return true
    })
  }, [availableRecipes, search, type, category, maxTime, tags])

  return (
    <Modal onClose={onClose}>
      <div className="recipe-picker">
        <h2>Åpne oppskrift</h2>

        <Filters
          search={search}
          onSearchChange={setSearch}
          type={type}
          onTypeChange={setType}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
          maxTime={maxTime}
          onMaxTimeChange={setMaxTime}
          tags={tags}
          onToggleTag={toggleTag}
        />

        <RecipeList
          recipes={filtered}
          onOpen={onSelect}
          onDelete={onDelete}
          emptyMessage="Ingen oppskrifter matcher søket."
        />
      </div>
    </Modal>
  )
}
