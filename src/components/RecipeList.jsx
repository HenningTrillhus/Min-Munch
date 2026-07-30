import RecipeCard from './RecipeCard'

export default function RecipeList({
  recipes,
  onOpen,
  emptyMessage = 'Ingen oppskrifter ennå. Legg til den første over!',
}) {
  if (recipes.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <div className="recipe-grid">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onOpen={onOpen} />
      ))}
    </div>
  )
}
