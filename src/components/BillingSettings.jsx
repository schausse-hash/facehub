import { useState } from 'react'

export default function BillingSettings({ onBack, session }) {
  const [products] = useState([
    { id: 1, name: 'Botox (Allergan)', units: 100, price: 450, inStock: true },
    { id: 2, name: 'Dysport', units: 300, price: 380, inStock: true },
    { id: 3, name: 'Xeomin', units: 100, price: 420, inStock: false },
    { id: 4, name: 'Juvederm Ultra', syringe: '1ml', price: 550, inStock: true },
    { id: 5, name: 'Juvederm Voluma', syringe: '1ml', price: 650, inStock: true },
    { id: 6, name: 'Restylane', syringe: '1ml', price: 500, inStock: true },
  ])

  const styles = {
    card: {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    },
    cardBody: {
      padding: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '2px solid var(--primary)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-muted)',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid var(--border)',
      color: 'var(--text-primary)',
      fontSize: '0.9rem'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    badgeSuccess: {
      background: 'var(--success-bg)',
      color: 'var(--success)'
    },
    badgeDanger: {
      background: 'var(--danger-bg)',
      color: 'var(--danger)'
    },
    infoBox: {
      background: 'rgba(90, 154, 156, 0.1)',
      border: '1px solid var(--primary)',
      borderRadius: '12px',
      padding: '1.25rem',
      marginTop: '1rem'
    },
    infoTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      color: 'var(--primary)',
      marginBottom: '0.75rem'
    },
    infoText: {
      fontSize: '0.9rem',
      color: 'var(--text-secondary)',
      lineHeight: '1.6'
    },
    btn: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.9rem',
      background: 'var(--primary)',
      color: 'white'
    }
  }

  return (
    <div>
      <div className="page-breadcrumb">
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a> | 
        <span style={{ color: 'var(--text-secondary)' }}> Produits et facturation</span>
      </div>

      <h1 className="page-title">PRODUITS ET FACTURATION</h1>

      {/* Products Section */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Inventaire des produits</h3>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Produit</th>
                <th style={styles.th}>Quantité</th>
                <th style={styles.th}>Prix</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td style={styles.td}>
                    <strong>{product.name}</strong>
                  </td>
                  <td style={styles.td}>
                    {product.units ? `${product.units} unités` : product.syringe}
                  </td>
                  <td style={styles.td}>${product.price}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(product.inStock ? styles.badgeSuccess : styles.badgeDanger)
                    }}>
                      {product.inStock ? 'En stock' : 'Rupture'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={{
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '1rem' }}>
            <button style={styles.btn}>+ Ajouter un produit</button>
          </div>
        </div>
      </div>

      {/* Billing Section */}
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h3 style={styles.sectionTitle}>Informations de facturation</h3>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Information
            </div>
            <p style={styles.infoText}>
              Cette section est en cours de développement. Vous pourrez bientôt gérer vos informations de facturation, 
              voir vos factures et configurer vos méthodes de paiement.
            </p>
          </div>
        </div>
      </div>

      <div className="copyright">
        DROITS D'AUTEUR © {new Date().getFullYear()} FACEHUB
      </div>
    </div>
  )
}
