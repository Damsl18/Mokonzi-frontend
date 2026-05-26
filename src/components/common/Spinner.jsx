/**
 * Spinner.jsx — Indicateur de chargement centré.
 */
const Spinner = ({ text = 'Chargement...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center py-5">
    <div className="spinner-border text-primary mb-3" role="status" style={{ width: 42, height: 42 }}>
      <span className="visually-hidden">Chargement</span>
    </div>
    <span className="text-secondary" style={{ fontSize: 14 }}>{text}</span>
  </div>
)
export default Spinner
