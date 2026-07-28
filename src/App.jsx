import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import RecipeStack from './components/RecipeStack'
import RecipePicker from './components/RecipePicker'
import Filters from './components/Filters'
import Modal from './components/Modal'
import SettingsButton from './components/SettingsButton'
import { deleteRecipeImage } from './lib/recipeImages'
import './App.css'

const PAGE_SIZE = 9
const THEME_KEY = 'min-munch-theme'

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formRecipe, setFormRecipe] = useState(null)
  const [openRecipes, setOpenRecipes] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [tags, setTags] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  function toggleTagFilter(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

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
  }, [search, type, category, maxTime, tags])

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, openRecipes.length - 1)))
  }, [openRecipes.length])

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
      setOpenRecipes((prev) => prev.map((r) => (r.id === data.id ? data : r)))
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
    setOpenRecipes((prev) => prev.map((r) => (r.id === data.id ? data : r)))
  }

  async function handleDelete(id) {
    if (!window.confirm('Er du sikker på at du vil slette denne oppskriften?')) return

    const previous = recipes
    const recipeToDelete = previous.find((r) => r.id === id)
    setRecipes((prev) => prev.filter((r) => r.id !== id))
    setOpenRecipes((prev) => prev.filter((r) => r.id !== id))

    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setRecipes(previous)
      return
    }
    if (recipeToDelete?.image_url) {
      deleteRecipeImage(recipeToDelete.image_url)
    }
  }

  function handleOpenRecipe(recipe) {
    setOpenRecipes([recipe])
    setActiveIndex(0)
  }

  function handleAddToStack(recipe) {
    setOpenRecipes((prev) => [...prev, recipe])
    setActiveIndex(openRecipes.length)
    setPickerOpen(false)
  }

  function handleCloseStack() {
    setOpenRecipes([])
    setActiveIndex(0)
  }

  function handleEditFromStack(recipe) {
    setOpenRecipes([])
    setActiveIndex(0)
    setFormRecipe(recipe)
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

      if (tags.length > 0 && !tags.some((tag) => r.tags?.includes(tag))) return false

      return true
    })
  }, [recipes, search, type, category, maxTime, tags])

  const visibleRecipes = filteredRecipes.slice(0, visibleCount)
  const hasMore = visibleCount < filteredRecipes.length
  const showMainUI = !formRecipe && openRecipes.length === 0

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
            tags={tags}
            onToggleTag={toggleTagFilter}
          />

          <section className="recipe-list-section">
            {loading ? (
              <p>Laster oppskrifter...</p>
            ) : (
              <>
                <RecipeList
                  recipes={visibleRecipes}
                  onOpen={handleOpenRecipe}
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
            categories={categories}
            onSave={handleSave}
            saving={saving}
            onSuccess={() => setFormRecipe(null)}
          />
        </Modal>
      )}

      {openRecipes.length > 0 && (
        <RecipeStack
          recipes={openRecipes}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onClose={handleCloseStack}
          onOpenPicker={() => setPickerOpen(true)}
          onEdit={handleEditFromStack}
          onDelete={handleDelete}
          onSaveMeta={handleSaveMeta}
        />
      )}

      {pickerOpen && (
        <RecipePicker
          recipes={recipes}
          categories={categories}
          openIds={openRecipes.map((r) => r.id)}
          onSelect={handleAddToStack}
          onDelete={handleDelete}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {showMainUI && <SettingsButton theme={theme} onToggleTheme={toggleTheme} />}
    </div>
  )
}

export default App
