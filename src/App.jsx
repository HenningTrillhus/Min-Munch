import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'
import Filters from './components/Filters'
import Modal from './components/Modal'
import SettingsButton from './components/SettingsButton'
import './App.css'

const PAGE_SIZE = 9
const THEME_KEY = 'min-munch-theme'

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formRecipe, setFormRecipe] = useState(null)
  const [viewingRecipe, setViewingRecipe] = useState(null)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadRecipes()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, type, category, maxTime])

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

  async function handleSave(payload) {
    setSaving(true)
    setError(null)

    if (formRecipe?.id) {
      const { data, error } = await supabase
        .from('recipes')
        .update(payload)
        .eq('id', formRecipe.id)
        .select()
        .single()

      setSaving(false)
      if (error) {
        setError(error.message)
        return false
      }
      setRecipes((prev) => prev.map((r) => (r.id === data.id ? data : r)))
      setViewingRecipe((prev) => (prev?.id === data.id ? data : prev))
      return true
    }

    const { data, error } = await supabase.from('recipes').insert(payload).select().single()

    setSaving(false)
    if (error) {
      setError(error.message)
      return false
    }
    setRecipes((prev) => [data, ...prev])
    return true
  }

  async function handleSaveMeta(id, payload) {
    const { data, error } = await supabase
      .from('recipes')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setError(error.message)
      return
    }
    setRecipes((prev) => prev.map((r) => (r.id === data.id ? data : r)))
  }

  async function handleDelete(id) {
    if (!window.confirm('Er du sikker på at du vil slette denne oppskriften?')) return

    const previous = recipes
    setRecipes((prev) => prev.filter((r) => r.id !== id))
    setViewingRecipe((prev) => (prev?.id === id ? null : prev))

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
      if (type && r.type !== type) return false
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
  }, [recipes, search, type, category, maxTime])

  const visibleRecipes = filteredRecipes.slice(0, visibleCount)
  const hasMore = visibleCount < filteredRecipes.length

  return (
    <div className="app">
      <section className="hero">
        <div className="hero-content">
          <h1>Min Munch</h1>
          <p>Din digitale oppskriftsbok — samle, søk og lag dine favorittretter.</p>
          <button type="button" className="hero-cta" onClick={() => setFormRecipe({})}>
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
            type={type}
            onTypeChange={setType}
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
                <RecipeList
                  recipes={visibleRecipes}
                  onOpen={setViewingRecipe}
                  onDelete={handleDelete}
                />
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

      {formRecipe && (
        <Modal onClose={() => setFormRecipe(null)}>
          <RecipeForm
            recipe={formRecipe}
            onSave={handleSave}
            saving={saving}
            onSuccess={() => setFormRecipe(null)}
          />
        </Modal>
      )}

      {viewingRecipe && (
        <RecipeDetail
          recipe={viewingRecipe}
          onClose={() => setViewingRecipe(null)}
          onEdit={(recipe) => {
            setViewingRecipe(null)
            setFormRecipe(recipe)
          }}
          onDelete={handleDelete}
          onSaveMeta={handleSaveMeta}
        />
      )}

      <SettingsButton theme={theme} onToggleTheme={toggleTheme} />
    </div>
  )
}

export default App
