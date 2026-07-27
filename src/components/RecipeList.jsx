import RecipeCard from './RecipeCard'

export default function RecipeList({ recipes, onOpen, onDelete }) {
  if (recipes.length === 0) {
    return <p className="empty-state">Ingen oppskrifter ennå. Legg til den første over!</p>
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onOpen={onOpen} onDelete={onDelete} />
      ))}
    </div>
  )
}
