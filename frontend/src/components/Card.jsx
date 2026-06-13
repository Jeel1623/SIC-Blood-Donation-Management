export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      padding: '20px 24px',
      ...style,
    }}>
      {children}
    </div>
  )
}
