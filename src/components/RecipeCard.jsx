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
          <div className="badge-group">
            {recipe.type && <span className="badge badge-type">{recipe.type}</span>}
            {recipe.category && <span className="badge">{recipe.category}</span>}
          </div>
        </div>

        {(recipe.difficulty > 0 || recipe.love_rating > 0) && (
          <div className="recipe-card-ratings">
            {recipe.difficulty > 0 && <StarRating value={recipe.difficulty} size="sm" />}
            {recipe.love_rating > 0 && (
              <StarRating icon="heart" value={recipe.love_rating} size="sm" />
            )}
          </div>
        )}

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
