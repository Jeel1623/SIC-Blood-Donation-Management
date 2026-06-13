const COLORS = {
  green:  { bg: '#E8F5E9', color: '#198754' },
  red:    { bg: '#FFF5F5', color: '#D71920' },
  yellow: { bg: '#FFFDE7', color: '#B78103' },
  blue:   { bg: '#E3F2FD', color: '#0d6efd' },
  grey:   { bg: '#F1F3F5', color: '#495057' },
}

export default function Badge({ children, variant = 'grey' }) {
  const { bg, color } = COLORS[variant] || COLORS.grey
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap',
      display: 'inline-block', border: `1px solid ${bg === '#FFF5F5' ? '#ffcdd2' : 'transparent'}`
    }}>
      {children}
    </span>
  )
}
