/**
 * ConfirmModal.jsx
 * Modal de confirmation générique (suppression, action critique).
 * Props : isOpen, title, message, onConfirm, onCancel, danger (bool)
 */
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, danger = true }) => {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: danger ? '#fee2e2' : '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: danger ? '#ef4444' : '#2563eb'
          }}>
            <i className={danger ? 'bi bi-exclamation-triangle' : 'bi bi-question-circle'} />
          </div>
          <div>
            <h5 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h5>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 24 }}>{message}</p>
        <div className="d-flex gap-3 justify-content-end">
          <button className="btn btn-light fw-semibold" onClick={onCancel} style={{ borderRadius: 8 }}>
            Annuler
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'} fw-semibold`}
            onClick={onConfirm}
            style={{ borderRadius: 8 }}
          >
            {danger ? 'Supprimer' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmModal
