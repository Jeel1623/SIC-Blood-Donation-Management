export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, borderBottom: 'none', paddingBottom: 0 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
