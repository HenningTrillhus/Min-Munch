import { useState } from 'react'

export default function SettingsButton({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const isDark = theme === 'dark'

  return (
    <div className="settings-widget">
      {open && (
        <>
          <div className="settings-backdrop" onClick={() => setOpen(false)} />
          <div className="settings-popover">
            <button type="button" onClick={onToggleTheme}>
              {isDark ? '☀️ Bytt til lyst design' : '🌙 Bytt til mørkt design'}
            </button>
          </div>
        </>
      )}
      <button
        type="button"
        className="settings-button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Innstillinger"
      >
        ⚙️
      </button>
    </div>
  )
}
