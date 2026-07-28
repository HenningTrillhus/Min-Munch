import { useEffect, useRef, useState } from 'react'
import StarRating from './StarRating'

function formatAmount(n) {
  const rounded = Math.round(n * 100) / 100
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

export default function RecipeDetail({ recipe, isActive, onSaveMeta }) {
  const [checkedSteps, setCheckedSteps] = useState(() => new Set())
  const baseServings = recipe.servings > 0 ? recipe.servings : null
  const [servings, setServings] = useState(baseServings ?? 1)
  const [loveRating, setLoveRating] = useState(recipe.love_rating ?? 0)
  const [notes, setNotes] = useState(recipe.notes ?? '')

  // Keep a ref in sync so the "leaving this recipe" effects below always read the
  // latest notes/rating, even inside a stale unmount-cleanup closure.
  const latest = useRef({ notes, loveRating })
  useEffect(() => {
    latest.current = { notes, loveRating }
  }, [notes, loveRating])

  function persistMeta() {
    const { notes: n, loveRating: lr } = latest.current
    const changed = lr !== (recipe.love_rating ?? 0) || n !== (recipe.notes ?? '')
    if (changed) {
      onSaveMeta(recipe.id, { love_rating: lr || null, notes: n.trim() || null })
    }
  }

  // This recipe stays mounted while it sits inactive in the stack (so checked-off
  // steps survive swiping away and back). Save notes/rating the moment it stops
  // being the visible one, and again if it's removed from the stack entirely.
  useEffect(() => {
    if (!isActive) persistMeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  useEffect(() => {
    return () => persistMeta()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const ratio = baseServings ? servings / baseServings : 1

  return (
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
            {recipe.tags?.includes('Vegetar') && (
              <span className="badge badge-tag">🌱 Vegetar</span>
            )}
            {recipe.tags?.includes('Fisk') && <span className="badge badge-tag">🐟 Fisk</span>}
          </div>
        </div>

        <div className="detail-ratings">
          {recipe.difficulty > 0 && (
            <div className="detail-rating-block">
              <span className="detail-rating-label">Vanskelighetsgrad</span>
              <StarRating value={recipe.difficulty} />
            </div>
          )}

          <div className="detail-rating-block">
            <span className="detail-rating-label">Din vurdering</span>
            <StarRating icon="heart" value={loveRating} onChange={setLoveRating} />
          </div>
        </div>

        <div className="recipe-card-meta">
          {recipe.prep_time_minutes != null && <span>⏱ {recipe.prep_time_minutes} min</span>}
          {recipe.price != null && <span>💰 {recipe.price} kr</span>}
        </div>

        {recipe.ingredients?.length > 0 && (
          <section>
            <div className="ingredient-section-header">
              <h2>Ingredienser</h2>
              {baseServings && (
                <div className="servings-stepper">
                  <button
                    type="button"
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    aria-label="Færre porsjoner"
                  >
                    −
                  </button>
                  <span>{servings} porsjoner</span>
                  <button
                    type="button"
                    onClick={() => setServings((s) => s + 1)}
                    aria-label="Flere porsjoner"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="ingredient-scale-row">
                  <span className="ingredient-scale-name">{ing.name}</span>
                  {ing.amount != null && (
                    <span className="ingredient-scale-amounts">
                      <span className="ingredient-scale-original">
                        {formatAmount(ing.amount)} {ing.unit}
                      </span>
                      {baseServings && ratio !== 1 && (
                        <>
                          <span className="ingredient-scale-arrow">→</span>
                          <span className="ingredient-scale-current">
                            {formatAmount(ing.amount * ratio)} {ing.unit}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </li>
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

        <section className="notes-field">
          <h2>Notater</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Skriv et notat om denne oppskriften — f.eks. hva du endret på eller hva som fungerte bra..."
          />
          <span className="notes-saved-hint">Lagres automatisk når du bytter til en annen oppskrift</span>
        </section>
      </div>
    </div>
  )
}
