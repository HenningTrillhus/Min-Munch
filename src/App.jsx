import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import './App.css'

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadRecipes()
    } else {
      setLoading(false)
    }
  }, [])

  async function loadRecipes() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setRecipes(data)
    }
    setLoading(false)
  }

  async function handleAdd(recipe) {
    setAdding(true)
    setError(null)
    const { data, error } = await supabase.from('recipes').insert(recipe).select().single()

    if (error) {
      setError(error.message)
    } else {
      setRecipes((prev) => [data, ...prev])
    }
    setAdding(false)
  }

  async function handleDelete(id) {
    const previous = recipes
    setRecipes((prev) => prev.filter((r) => r.id !== id))

    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setRecipes(previous)
    }
  }

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>Min Munch 🍲</h1>
        <p>Din digitale oppskriftsbok</p>
      </header>

      {!isSupabaseConfigured && (
        <div className="error-banner">
          Supabase er ikke konfigurert ennå.
          <br />
          Kopier <code>.env.example</code> til <code>.env</code>, fyll inn dine Supabase-nøkler,
          kjør <code>supabase/schema.sql</code> i Supabase, og start dev-serveren på nytt.
        </div>
      )}

      {error && (
        <div className="error-banner">
          Noe gikk galt: {error}
        </div>
      )}

      <main>
        <RecipeForm onAdd={handleAdd} adding={adding} />

        <section className="recipe-list-section">
          <div className="list-header">
            <h2>Oppskrifter</h2>
            <input
              type="search"
              placeholder="Søk etter oppskrift..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Laster oppskrifter...</p>
          ) : (
            <RecipeList recipes={filteredRecipes} onDelete={handleDelete} />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
