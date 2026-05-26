/**
 * AlertBadge.jsx
 * Bandeau d'alerte affiché quand des produits sont en stock faible (< 10 unités).
 * Props : products (tableau de produits en stock faible)
 */
const AlertBadge = ({ products = [] }) => {
  if (!products.length) return null
  return (
    <div className="stock-alert-banner">
      <div style={{ fontSize: 24 }}>⚠️</div>
      <div>
        <strong style={{ fontSize: 14, color: '#92400e' }}>
          Alerte stock faible — {products.length} produit(s) en dessous de 10 unités
        </strong>
        <div style={{ fontSize: 13, color: '#78350f', marginTop: 4 }}>
          {products.map((p, i) => (
            <span key={p.id}>
              <strong>{p.name}</strong> ({p.quantity_in_stock} unité{p.quantity_in_stock > 1 ? 's' : ''})
              {i < products.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
export default AlertBadge
