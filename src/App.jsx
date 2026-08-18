import { useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'
import RecipeForm from './components/RecipeForm'
import RecipeList from './components/RecipeList'
import RecipeStack from './components/RecipeStack'
import RecipePicker from './components/RecipePicker'
import Filters from './components/Filters'
import Modal from './components/Modal'
import ConfirmDialog from './components/ConfirmDialog'
import SettingsButton from './components/SettingsButton'
import { deleteRecipeImage } from './lib/recipeImages'
import './App.css'

const PAGE_SIZE = 9
const MOBILE_PAGE_SIZE = 8
const MOBILE_BREAKPOINT = '(max-width: 640px)'
const THEME_KEY = 'min-munch-theme'

// 9 cards looks right in the desktop 3-column grid, but leaves an odd one
// dangling on the mobile 2-column grid — 8 fills full rows there instead.
function getPageSize() {
  if (typeof window === 'undefined') return PAGE_SIZE
  return window.matchMedia(MOBILE_BREAKPOINT).matches ? MOBILE_PAGE_SIZE : PAGE_SIZE
}

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formRecipe, setFormRecipe] = useState(null)
  const [formMinimized, setFormMinimized] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [openRecipes, setOpenRecipes] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [stackVisible, setStackVisible] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [tags, setTags] = useState([])
  const [pageSize, setPageSize] = useState(getPageSize)
  const [visibleCount, setVisibleCount] = useState(getPageSize)

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
    setVisibleCount(pageSize)
  }, [search, type, category, maxTime, tags, pageSize])

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT)
    const handleChange = () => setPageSize(getPageSize())
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

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

  function requestDelete(id) {
    const recipe = recipes.find((r) => r.id === id)
    if (recipe) setDeleteTarget(recipe)
  }

  function cancelDelete() {
    setDeleteTarget(null)
  }

  async function performDelete() {
    const target = deleteTarget
    if (!target) return
    setDeleteTarget(null)

    const previous = recipes
    setRecipes((prev) => prev.filter((r) => r.id !== target.id))
    setOpenRecipes((prev) => prev.filter((r) => r.id !== target.id))
    if (formRecipe?.id === target.id) {
      setFormRecipe(null)
      setFormMinimized(false)
    }

    const { error } = await supabase.from('recipes').delete().eq('id', target.id)
    if (error) {
      setError(error.message)
      setRecipes(previous)
      return
    }
    if (target.image_url) {
      deleteRecipeImage(target.image_url)
    }
  }

  // Used both from the home grid and from the "open another recipe" picker: if the
  // recipe is already part of the current cooking session, just jump to it instead
  // of duplicating it, so you never lose progress on the others by re-opening one.
  function openRecipeInStack(recipe) {
    setOpenRecipes((prev) => {
      const existingIndex = prev.findIndex((r) => r.id === recipe.id)
      if (existingIndex !== -1) {
        setActiveIndex(existingIndex)
        return prev
      }
      setActiveIndex(prev.length)
      return [...prev, recipe]
    })
    setStackVisible(true)
    setPickerOpen(false)
  }

  // A draft recipe form only ever occupies one slot, so opening/minimizing/resuming
  // never discards what's typed in — the underlying RecipeForm stays mounted the
  // whole time (hidden with CSS, same trick as the recipe-stack), and if you try to
  // open a *different* form while one is already in progress we just resume the
  // existing draft instead of silently overwriting it.
  function handleOpenNewForm() {
    if (formRecipe) {
      setFormMinimized(false)
      return
    }
    setFormRecipe({})
  }

  function handleMinimizeForm() {
    setFormMinimized(true)
  }

  function handleResumeForm() {
    setFormMinimized(false)
  }

  function handleDiscardForm() {
    setFormRecipe(null)
    setFormMinimized(false)
  }

  function handleFormSuccess() {
    setFormRecipe(null)
    setFormMinimized(false)
  }

  function handleBackToHome() {
    setStackVisible(false)
  }

  function handleFinishCooking() {
    setOpenRecipes([])
    setActiveIndex(0)
    setStackVisible(false)
  }

  function handleEditFromStack(recipe) {
    if (formRecipe) {
      setFormMinimized(false)
      return
    }
    setOpenRecipes([])
    setActiveIndex(0)
    setStackVisible(false)
    setFormRecipe(recipe)
  }

  const categories = useMemo(
    () => [...new Set(recipes.flatMap((r) => r.categories ?? []))].sort(),
    [recipes]
  )

  // How often each category is used across the whole recipe book — used to pick
  // which categories a card shows first when a recipe has more than fit.
  const categoryPopularity = useMemo(() => {
    const counts = new Map()
    recipes.forEach((r) => {
      ;(r.categories ?? []).forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1))
    })
    return counts
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
      if (type && r.type !== type) return false
      if (category && !r.categories?.includes(category)) return false

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
  const showMainUI = (!formRecipe || formMinimized) && !stackVisible

  return (
    <div className="app">
      <section className="hero">
        <div className="hero-content">
          <h1>Min Munch</h1>
          <p>Din digitale oppskriftsbok — samle, søk og lag dine favorittretter.</p>
          <button type="button" className="hero-cta" onClick={handleOpenNewForm}>
            + Ny oppskrift
          </button>
          {openRecipes.length > 0 && !stackVisible && (
            <button
              type="button"
              className="continue-cooking-button"
              onClick={() => setStackVisible(true)}
            >
              🍳 Fortsett matlaging ({openRecipes.length})
            </button>
          )}
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
                  onOpen={openRecipeInStack}
                  categoryPopularity={categoryPopularity}
                />
                {hasMore && (
                  <div className="show-more">
                    <button type="button" onClick={() => setVisibleCount((c) => c + pageSize)}>
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
        <Modal hidden={formMinimized} onClose={handleMinimizeForm}>
          <RecipeForm
            recipe={formRecipe}
            categories={categories}
            onSave={handleSave}
            saving={saving}
            onSuccess={handleFormSuccess}
            onDelete={requestDelete}
            onDiscard={handleDiscardForm}
          />
        </Modal>
      )}

      {formRecipe && formMinimized && !stackVisible && (
        <button type="button" className="active-draft-button" onClick={handleResumeForm}>
          <span className="active-draft-icon" aria-hidden="true">
            🍴
          </span>
          Aktiv oppskrift
        </button>
      )}

      {openRecipes.length > 0 && (
        <RecipeStack
          visible={stackVisible}
          recipes={openRecipes}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onBack={handleBackToHome}
          onFinish={handleFinishCooking}
          onOpenPicker={() => setPickerOpen(true)}
          onEdit={handleEditFromStack}
          onSaveMeta={handleSaveMeta}
        />
      )}

      {pickerOpen && (
        <RecipePicker
          recipes={recipes}
          categories={categories}
          categoryPopularity={categoryPopularity}
          openIds={openRecipes.map((r) => r.id)}
          onSelect={openRecipeInStack}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {showMainUI && <SettingsButton theme={theme} onToggleTheme={toggleTheme} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Slette oppskrift?"
          message={
            <>
              Er du sikker på at du vil slette <strong>{deleteTarget.title}</strong>? Dette kan
              ikke angres.
            </>
          }
          onConfirm={performDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  )
}

export default App
