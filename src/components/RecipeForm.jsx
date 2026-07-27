import { useState } from 'react'
import StarRating from './StarRating'

const emptyForm = {
  title: '',
  category: '',
  prep_time_minutes: '',
  servings: '',
  price: '',
  difficulty: 0,
  ingredients: '',
  instructions: '',
  image_url: '',
}

function toFormState(recipe) {
  if (!recipe) return emptyForm
  return {
    title: recipe.title ?? '',
    category: recipe.category ?? '',
    prep_time_minutes: recipe.prep_time_minutes ?? '',
    servings: recipe.servings ?? '',
    price: recipe.price ?? '',
    difficulty: recipe.difficulty ?? 0,
    ingredients: (recipe.ingredients ?? []).join('\n'),
    instructions: recipe.instructions ?? '',
    image_url: recipe.image_url ?? '',
  }
}

export default function RecipeForm({ recipe, onSave, saving, onSuccess }) {
  const [form, setForm] = useState(() => toFormState(recipe))
  const isEditing = Boolean(recipe?.id)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.instructions.trim()) return

    const ok = await onSave({
      title: form.title.trim(),
      category: form.category.trim() || null,
      prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
      servings: form.servings ? Number(form.servings) : null,
      price: form.price ? Number(form.price) : null,
      difficulty: form.difficulty || null,
      ingredients: form.ingredients
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      instructions: form.instructions.trim(),
      image_url: form.image_url.trim() || null,
    })

    if (ok) {
      setForm(emptyForm)
      onSuccess?.()
    }
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Rediger oppskrift' : 'Ny oppskrift'}</h2>

      <label>
        Tittel *
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <div className="form-row">
        <label>
          Kategori
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="f.eks. middag, dessert"
          />
        </label>

        <label>
          Tilberedningstid (min)
          <input
            name="prep_time_minutes"
            type="number"
            min="0"
            value={form.prep_time_minutes}
            onChange={handleChange}
          />
        </label>

        <label>
          Porsjoner
          <input
            name="servings"
            type="number"
            min="0"
            value={form.servings}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Pris (kr)
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
          />
        </label>

        <label>
          Vanskelighetsgrad
          <StarRating
            value={form.difficulty}
            onChange={(difficulty) => setForm((prev) => ({ ...prev, difficulty }))}
          />
        </label>

        <label>
          Bilde-URL
          <input name="image_url" value={form.image_url} onChange={handleChange} />
        </label>
      </div>

      <label>
        Ingredienser (én per linje)
        <textarea
          name="ingredients"
          value={form.ingredients}
          onChange={handleChange}
          rows={5}
          placeholder={'2 dl melk\n3 egg\n...'}
        />
      </label>

      <label>
        Fremgangsmåte — ett steg per linje *
        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          rows={6}
          placeholder={'Bland melk og egg\nVisp godt sammen\nStek på middels varme\n...'}
          required
        />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Lagrer...' : isEditing ? 'Lagre endringer' : 'Lagre oppskrift'}
      </button>
    </form>
  )
}
