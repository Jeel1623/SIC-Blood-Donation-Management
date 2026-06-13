import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'

const MOCK_BARS = [4, 7, 5, 9, 6, 8, 11, 7, 10, 8, 13, 9]

export default function StatCard({ label, value, delta, color = '#198754', icon: Icon }) {
  const bars = MOCK_BARS.map((v, i) => ({ v }))
  const positive = delta === undefined ? null : delta >= 0
  const TrendIcon = delta === undefined ? Minus : delta >= 0 ? TrendingUp : TrendingDown
  const trendColor = delta === undefined ? 'var(--muted)' : delta >= 0 ? 'var(--accent2)' : 'var(--accent)'

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderTop: `4px solid ${color}`,
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
          {delta !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <TrendIcon size={13} color={trendColor} strokeWidth={2.5} />
              <span style={{ fontSize: 12, color: trendColor, fontWeight: 700 }}>
                {delta >= 0 ? '+' : ''}{delta}%
              </span>
            </div>
          )}
          <p style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
        </div>
        {Icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={color} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div style={{ height: 40, marginTop: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} barSize={10}>
            <Bar dataKey="v" fill={color} radius={2} opacity={0.7} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
