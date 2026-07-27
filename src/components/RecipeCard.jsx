import { useState } from 'react'

export default function RecipeCard({ recipe, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className={`recipe-card ${expanded ? 'expanded' : ''}`}>
      {recipe.image_url && (
        <img className="recipe-card-image" src={recipe.image_url} alt={recipe.title} />
      )}

      <div className="recipe-card-body">
        <div className="recipe-card-header">
          <h3>{recipe.title}</h3>
          {recipe.category && <span className="badge">{recipe.category}</span>}
        </div>

        <div className="recipe-card-meta">
          {recipe.prep_time_minutes != null && <span>⏱ {recipe.prep_time_minutes} min</span>}
          {recipe.servings != null && <span>🍽 {recipe.servings} porsjoner</span>}
        </div>

        {expanded && (
          <div className="recipe-card-details">
            {recipe.ingredients?.length > 0 && (
              <>
                <h4>Ingredienser</h4>
                <ul>
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </>
            )}

            <h4>Fremgangsmåte</h4>
            <p className="instructions">{recipe.instructions}</p>
          </div>
        )}

        <div className="recipe-card-actions">
          <button type="button" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Skjul' : 'Vis oppskrift'}
          </button>
          <button type="button" className="danger" onClick={() => onDelete(recipe.id)}>
            Slett
          </button>
        </div>
      </div>
    </article>
  )
}
