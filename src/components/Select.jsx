import { useEffect, useRef, useState } from 'react'

function normalize(options) {
  return options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Velg...',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const items = normalize(options)
  const selected = items.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className={`select-root ${className}`} ref={rootRef}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={selected ? '' : 'select-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`select-arrow ${open ? 'open' : ''}`}>⌄</span>
      </button>

      {open && (
        <ul className="select-menu" role="listbox">
          {items.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={opt.value === value ? 'active' : ''}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
