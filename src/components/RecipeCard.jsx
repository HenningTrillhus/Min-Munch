import StarRating from './StarRating'

export default function RecipeCard({ recipe, onOpen, onDelete }) {
  return (
    <article className="recipe-card" onClick={() => onOpen(recipe)}>
      {recipe.image_url ? (
        <img className="recipe-card-image" src={recipe.image_url} alt={recipe.title} />
      ) : (
        <div className="recipe-card-image recipe-card-image-placeholder" aria-hidden="true">
          🍽
        </div>
      )}

      <div className="recipe-card-body">
        <div className="recipe-card-header">
          <h3>{recipe.title}</h3>
          {recipe.category && <span className="badge">{recipe.category}</span>}
        </div>

        {recipe.difficulty > 0 && <StarRating value={recipe.difficulty} size="sm" />}

        <div className="recipe-card-meta">
          {recipe.prep_time_minutes != null && <span>⏱ {recipe.prep_time_minutes} min</span>}
          {recipe.servings != null && <span>🍽 {recipe.servings} porsjoner</span>}
          {recipe.price != null && <span>💰 {recipe.price} kr</span>}
        </div>

        <div className="recipe-card-actions">
          <button type="button" onClick={() => onOpen(recipe)}>
            Vis oppskrift
          </button>
          <button
            type="button"
            className="danger"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(recipe.id)
            }}
          >
            Slett
          </button>
        </div>
      </div>
    </article>
  )
}
