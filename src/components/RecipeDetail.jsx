import { useState } from 'react'
import StarRating from './StarRating'

export default function RecipeDetail({ recipe, onClose, onEdit, onDelete }) {
  const [checkedSteps, setCheckedSteps] = useState(() => new Set())

  const steps = (recipe.instructions || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  function toggleStep(i) {
    setCheckedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="detail-overlay">
      <div className="detail-topbar">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Lukk">
          ← Tilbake
        </button>
        <div className="detail-topbar-actions">
          <button type="button" onClick={() => onEdit(recipe)}>
            Rediger
          </button>
          <button type="button" className="danger" onClick={() => onDelete(recipe.id)}>
            Slett
          </button>
        </div>
      </div>

      <div className="detail-content">
        {recipe.image_url ? (
          <img className="detail-image" src={recipe.image_url} alt={recipe.title} />
        ) : (
          <div className="detail-image detail-image-placeholder" aria-hidden="true">
            🍽
          </div>
        )}

        <div className="detail-body">
          <div className="detail-header">
            <h1>{recipe.title}</h1>
            <div className="badge-group">
              {recipe.type && <span className="badge badge-type">{recipe.type}</span>}
              {recipe.category && <span className="badge">{recipe.category}</span>}
            </div>
          </div>

          {recipe.difficulty > 0 && <StarRating value={recipe.difficulty} />}

          <div className="recipe-card-meta">
            {recipe.prep_time_minutes != null && <span>⏱ {recipe.prep_time_minutes} min</span>}
            {recipe.servings != null && <span>🍽 {recipe.servings} porsjoner</span>}
            {recipe.price != null && <span>💰 {recipe.price} kr</span>}
          </div>

          {recipe.ingredients?.length > 0 && (
            <section>
              <h2>Ingredienser</h2>
              <ul className="ingredient-list">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2>Fremgangsmåte</h2>
            <ul className="step-list">
              {steps.map((step, i) => (
                <li key={i}>
                  <label className={checkedSteps.has(i) ? 'checked' : ''}>
                    <input
                      type="checkbox"
                      checked={checkedSteps.has(i)}
                      onChange={() => toggleStep(i)}
                    />
                    <span className="step-number">{i + 1}</span>
                    <span className="step-text">{step}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
