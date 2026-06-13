import {
  LayoutDashboard, UserPlus, Search, Droplets,
  AlertTriangle, Clock, BarChart2, HeartPulse, LogOut, CircleUser, Heart, Droplet
} from 'lucide-react'

const NAV = [
  { label: 'Home',               icon: LayoutDashboard },
  { label: 'Donor Registration', icon: UserPlus },
  { label: 'Find Donor',         icon: Search },
  { label: 'Blood Inventory',    icon: Droplets },
  { label: 'Emergency Requests', icon: AlertTriangle },
  { label: 'Donation History',   icon: Clock },
  { label: 'Analytics',          icon: BarChart2 },
]

const s = {
  sidebar: {
    width: 'var(--sidebar-w)',
    minWidth: 'var(--sidebar-w)',
    background: 'var(--surface)',
    borderRight: '1px solid #e9ecef',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '24px 20px',
    borderBottom: '1px solid #e9ecef',
  },
  logoIcon: {
    width: 38,
    height: 38,
    background: 'linear-gradient(135deg, #D71920, #B51217)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 10px rgba(215, 25, 32, 0.2)',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 800,
    color: 'var(--accent)',
    lineHeight: 1.15,
  },
  logoSub: { 
    fontSize: 10.5, 
    color: 'var(--text)', 
    fontWeight: 600, 
    marginTop: 1,
    letterSpacing: '0.02em',
  },
  section: { padding: '20px 14px' },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--muted)',
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    padding: '0 10px',
    marginBottom: 8,
  },
  item: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 4,
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? '#ffffff' : '#495057',
    fontWeight: active ? 600 : 500,
    fontSize: 13.5,
    transition: 'all .15s',
    userSelect: 'none',
  }),
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid #e9ecef',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '16px 16px',
    borderBottom: '1px solid #e9ecef',
  },
  footerNote: {
    padding: '12px 16px',
    fontSize: 11,
    color: 'var(--muted)',
    textAlign: 'center',
    background: '#f8f9fa',
  },
}

export default function Sidebar({ current, onNavigate, username, onLogout }) {
  return (
    <nav style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoIcon}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={16} color="#fff" fill="#fff" style={{ transform: 'translateY(-1px)' }} />
            <Droplet size={8} color="#fff" fill="#fff" style={{ position: 'absolute', top: 5, left: 4 }} />
          </div>
        </div>
        <div>
          <div style={s.logoText}>Blood Donation</div>
          <div style={s.logoSub}>Management System</div>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.sectionLabel}>Navigation</div>
        {NAV.map(({ label, icon: Icon }) => (
          <div
            key={label}
            style={s.item(current === label)}
            onClick={() => onNavigate(label)}
            onMouseEnter={e => {
              if (current !== label) {
                e.currentTarget.style.background = 'var(--surface2)'
                e.currentTarget.style.color = 'var(--accent)'
              }
            }}
            onMouseLeave={e => {
              if (current !== label) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#495057'
              }
            }}
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </div>
        ))}
      </div>

      <div style={s.footer}>
        {username && (
          <div style={s.userRow}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CircleUser size={16} color="var(--accent)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>Logged in</p>
            </div>
            <button onClick={onLogout} title="Sign out" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <LogOut size={14} color="var(--muted)" />
            </button>
          </div>
        )}
        <div style={s.footerNote}>SIC Hackathon 2026</div>
      </div>
    </nav>
  )
}
