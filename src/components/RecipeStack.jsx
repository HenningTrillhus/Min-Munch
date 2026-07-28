import { useEffect, useRef, useState } from 'react'
import RecipeDetail from './RecipeDetail'

export default function RecipeStack({
  recipes,
  activeIndex,
  onActiveIndexChange,
  onClose,
  onOpenPicker,
  onEdit,
  onDelete,
  onSaveMeta,
}) {
  const viewportRef = useRef(null)
  const dragPxRef = useRef(0)
  const [dragPx, setDragPx] = useState(0)
  const [dragging, setDragging] = useState(false)

  const safeIndex = Math.min(activeIndex, recipes.length - 1)
  const activeRecipe = recipes[safeIndex]

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const drag = { startX: 0, startY: 0, locked: null }

    function handleTouchStart(e) {
      const t = e.touches[0]
      drag.startX = t.clientX
      drag.startY = t.clientY
      drag.locked = null
    }

    function handleTouchMove(e) {
      const t = e.touches[0]
      const dx = t.clientX - drag.startX
      const dy = t.clientY - drag.startY

      if (!drag.locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        drag.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (drag.locked === 'x') setDragging(true)
      }

      if (drag.locked === 'x') {
        e.preventDefault()
        let delta = dx
        if (safeIndex === 0 && delta > 0) delta *= 0.35
        if (safeIndex === recipes.length - 1 && delta < 0) delta *= 0.35
        dragPxRef.current = delta
        setDragPx(delta)
      }
    }

    function handleTouchEnd() {
      if (drag.locked === 'x') {
        const threshold = 60
        const delta = dragPxRef.current
        if (delta < -threshold && safeIndex < recipes.length - 1) {
          onActiveIndexChange(safeIndex + 1)
        } else if (delta > threshold && safeIndex > 0) {
          onActiveIndexChange(safeIndex - 1)
        }
      }
      drag.locked = null
      dragPxRef.current = 0
      setDragPx(0)
      setDragging(false)
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)
    el.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [safeIndex, recipes.length, onActiveIndexChange])

  if (!activeRecipe) return null

  return (
    <div className="recipe-stack">
      <div className="detail-topbar">
        <button type="button" className="detail-close" onClick={onClose} aria-label="Lukk">
          ← Tilbake
        </button>
        <div className="detail-topbar-actions">
          {recipes.length > 1 && (
            <span className="stack-counter">
              {safeIndex + 1} / {recipes.length}
            </span>
          )}
          <button type="button" onClick={() => onEdit(activeRecipe)}>
            Rediger
          </button>
          <button type="button" className="danger" onClick={() => onDelete(activeRecipe.id)}>
            Slett
          </button>
        </div>
      </div>

      <div className="stack-viewport" ref={viewportRef}>
        <div
          className="stack-track"
          style={{
            transform: `translateX(calc(${-safeIndex * 100}vw + ${dragPx}px))`,
            transition: dragging ? 'none' : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {recipes.map((recipe, i) => (
            <div className="stack-page" key={recipe.id}>
              <RecipeDetail recipe={recipe} isActive={i === safeIndex} onSaveMeta={onSaveMeta} />
            </div>
          ))}
        </div>
      </div>

      <div className="stack-bottom-nav">
        {recipes.length > 1 && (
          <div className="stack-arrows">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={() => onActiveIndexChange(safeIndex - 1)}
              aria-label="Forrige oppskrift"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={safeIndex === recipes.length - 1}
              onClick={() => onActiveIndexChange(safeIndex + 1)}
              aria-label="Neste oppskrift"
            >
              ›
            </button>
          </div>
        )}
        <button type="button" className="open-new-button" onClick={onOpenPicker}>
          + Åpne ny oppskrift
        </button>
      </div>
    </div>
  )
}
