import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import Filters from './components/Filters'
import Modal from './components/Modal'
import './App.css'

const PAGE_SIZE = 9

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadRecipes()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, category, maxTime])

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

    setAdding(false)
    if (error) {
      setError(error.message)
      return false
    }
    setRecipes((prev) => [data, ...prev])
    return true
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

  const categories = useMemo(
    () => [...new Set(recipes.map((r) => r.category).filter(Boolean))].sort(),
    [recipes]
  )

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      if (category && r.category !== category) return false

      if (maxTime) {
        if (r.prep_time_minutes == null) return false
        if (maxTime === '60+') {
          if (r.prep_time_minutes < 60) return false
        } else if (r.prep_time_minutes >= Number(maxTime)) {
          return false
        }
      }

      return true
    })
  }, [recipes, search, category, maxTime])

  const visibleRecipes = filteredRecipes.slice(0, visibleCount)
  const hasMore = visibleCount < filteredRecipes.length

  return (
    <div className="app">
      <section className="hero">
        <div className="hero-content">
          <h1>Min Munch</h1>
          <p>Din digitale oppskriftsbok — samle, søk og lag dine favorittretter.</p>
          <button type="button" className="hero-cta" onClick={() => setShowForm(true)}>
            + Ny oppskrift
          </button>
        </div>
      </section>

      <div className="page-content">
        {!isSupabaseConfigured && (
          <div className="error-banner">
            Supabase er ikke konfigurert ennå.
            <br />
            Kopier <code>.env.example</code> til <code>.env</code>, fyll inn dine Supabase-nøkler,
            kjør <code>supabase/schema.sql</code> i Supabase, og start dev-serveren på nytt.
          </div>
        )}

        {error && <div className="error-banner">Noe gikk galt: {error}</div>}

        <main>
          <Filters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            categories={categories}
            maxTime={maxTime}
            onMaxTimeChange={setMaxTime}
          />

          <section className="recipe-list-section">
            {loading ? (
              <p>Laster oppskrifter...</p>
            ) : (
              <>
                <RecipeList recipes={visibleRecipes} onDelete={handleDelete} />
                {hasMore && (
                  <div className="show-more">
                    <button type="button" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                      Vis mer
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <RecipeForm onAdd={handleAdd} adding={adding} onSuccess={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  )
}

export default App
