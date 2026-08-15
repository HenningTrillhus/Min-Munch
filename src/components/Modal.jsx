export default function Modal({ hidden, onClose, children }) {
  return (
    <div
      className={`modal-overlay ${hidden ? 'modal-overlay-hidden' : ''}`}
      onClick={onClose}
    >
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Gå tilbake">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
