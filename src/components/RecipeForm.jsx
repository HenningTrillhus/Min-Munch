import { useState } from 'react'
import StarRating from './StarRating'
import Select from './Select'
import ComboBox from './ComboBox'
import { FOOD_TYPES, TAG_OPTIONS, INGREDIENT_UNITS } from '../constants'
import { uploadRecipeImage, deleteRecipeImage } from '../lib/recipeImages'

const TYPE_OPTIONS = [{ value: '', label: 'Ikke valgt' }, ...FOOD_TYPES.map((t) => ({ value: t, label: t }))]

const emptyForm = {
  title: '',
  category: '',
  type: '',
  tags: [],
  prep_time_minutes: '',
  servings: '',
  price: '',
  difficulty: 0,
  instructions: '',
  image_url: '',
}

const emptyIngredientRow = { amount: '', unit: 'stk', name: '' }

function toFormState(recipe) {
  if (!recipe) return emptyForm
  return {
    title: recipe.title ?? '',
    category: recipe.category ?? '',
    type: recipe.type ?? '',
    tags: recipe.tags ?? [],
    prep_time_minutes: recipe.prep_time_minutes ?? '',
    servings: recipe.servings ?? '',
    price: recipe.price ?? '',
    difficulty: recipe.difficulty ?? 0,
    instructions: recipe.instructions ?? '',
    image_url: recipe.image_url ?? '',
  }
}

function toIngredientRows(recipe) {
  const ingredients = recipe?.ingredients
  if (!ingredients || ingredients.length === 0) return [emptyIngredientRow]
  return ingredients.map((ing) => ({
    amount: ing.amount ?? '',
    unit: ing.unit ?? 'stk',
    name: ing.name ?? '',
  }))
}

export default function RecipeForm({ recipe, categories, onSave, saving, onSuccess, onDelete }) {
  const [form, setForm] = useState(() => toFormState(recipe))
  const [ingredientRows, setIngredientRows] = useState(() => toIngredientRows(recipe))
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState(null)
  const isEditing = Boolean(recipe?.id)
  const originalImageUrl = recipe?.image_url ?? null

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  // The image currently saved on the recipe is only deleted from storage once the
  // form actually saves — otherwise cancelling would leave the DB pointing at a
  // file we already removed. Anything uploaded-then-replaced within this editing
  // session (never saved) is safe to delete right away.
  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadingImage(true)
    setImageError(null)
    const previousUrl = form.image_url

    try {
      const url = await uploadRecipeImage(file)
      setForm((prev) => ({ ...prev, image_url: url }))
      if (previousUrl && previousUrl !== originalImageUrl) {
        deleteRecipeImage(previousUrl)
      }
    } catch {
      setImageError('Kunne ikke laste opp bildet. Prøv igjen.')
    } finally {
      setUploadingImage(false)
    }
  }

  function handleRemoveImage() {
    const previousUrl = form.image_url
    setForm((prev) => ({ ...prev, image_url: '' }))
    if (previousUrl && previousUrl !== originalImageUrl) {
      deleteRecipeImage(previousUrl)
    }
  }

  function updateIngredientRow(i, field, value) {
    setIngredientRows((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)))
  }

  function addIngredientRow() {
    setIngredientRows((prev) => [...prev, { ...emptyIngredientRow }])
  }

  function removeIngredientRow(i) {
    setIngredientRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.instructions.trim()) return

    const ingredients = ingredientRows
      .filter((row) => row.name.trim())
      .map((row) => ({
        amount: row.amount !== '' ? Number(row.amount) : null,
        unit: row.amount !== '' ? row.unit : null,
        name: row.name.trim(),
      }))

    const ok = await onSave({
      title: form.title.trim(),
      category: form.category.trim() || null,
      type: form.type || null,
      tags: form.tags,
      prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
      servings: form.servings ? Number(form.servings) : null,
      price: form.price ? Number(form.price) : null,
      difficulty: form.difficulty || null,
      ingredients,
      instructions: form.instructions.trim(),
      image_url: form.image_url.trim() || null,
    })

    if (ok) {
      if (originalImageUrl && originalImageUrl !== form.image_url) {
        deleteRecipeImage(originalImageUrl)
      }
      setForm(emptyForm)
      setIngredientRows([emptyIngredientRow])
      onSuccess?.()
    }
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <div className="recipe-form-header">
        <h2>{isEditing ? 'Rediger oppskrift' : 'Ny oppskrift'}</h2>
        {isEditing && (
          <button type="button" className="form-delete-button" onClick={() => onDelete(recipe.id)}>
            🗑️ Slett oppskrift
          </button>
        )}
      </div>

      <label>
        Tittel *
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <div className="form-row">
        <label>
          Kategori
          <ComboBox
            options={categories}
            value={form.category}
            onChange={(v) => setForm((prev) => ({ ...prev, category: v }))}
            placeholder="f.eks. varm rett, sunt"
          />
        </label>

        <label>
          Type mat
          <Select
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={(v) => setForm((prev) => ({ ...prev, type: v }))}
            placeholder="Ikke valgt"
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
      </div>

      <div className="tags-field">
        {TAG_OPTIONS.map((tag) => (
          <label key={tag} className="tag-checkbox">
            <input
              type="checkbox"
              checked={form.tags.includes(tag)}
              onChange={() => toggleTag(tag)}
            />
            {tag}
          </label>
        ))}
      </div>

      <div className="form-row">
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
      </div>

      <div className="image-field">
        <span className="ingredient-field-label">Bilde</span>

        {form.image_url ? (
          <div className="image-preview">
            <img src={form.image_url} alt="Forhåndsvisning" />
            <button type="button" onClick={handleRemoveImage} disabled={uploadingImage}>
              Fjern bilde
            </button>
          </div>
        ) : (
          <label className="image-upload-button">
            {uploadingImage ? 'Laster opp...' : '📷 Velg bilde'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploadingImage}
              hidden
            />
          </label>
        )}

        {imageError && <span className="image-error">{imageError}</span>}
      </div>

      <div className="ingredient-field">
        <span className="ingredient-field-label">Ingredienser</span>

        <div className="ingredient-rows">
          {ingredientRows.map((row, i) => (
            <div className="ingredient-row" key={i}>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Mengde"
                className="ingredient-amount"
                value={row.amount}
                onChange={(e) => updateIngredientRow(i, 'amount', e.target.value)}
              />
              <Select
                className="select-compact"
                options={INGREDIENT_UNITS}
                value={row.unit}
                onChange={(v) => updateIngredientRow(i, 'unit', v)}
              />
              <input
                type="text"
                placeholder="Ingrediens, f.eks. egg"
                className="ingredient-name"
                value={row.name}
                onChange={(e) => updateIngredientRow(i, 'name', e.target.value)}
              />
              <button
                type="button"
                className="ingredient-remove"
                onClick={() => removeIngredientRow(i)}
                disabled={ingredientRows.length === 1}
                aria-label="Fjern ingrediens"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="ingredient-add" onClick={addIngredientRow}>
          + Legg til ingrediens
        </button>
      </div>

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

      <button type="submit" disabled={saving || uploadingImage}>
        {saving ? 'Lagrer...' : isEditing ? 'Lagre endringer' : 'Lagre oppskrift'}
      </button>
    </form>
  )
}
