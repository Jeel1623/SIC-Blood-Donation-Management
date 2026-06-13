import { useEffect, useState } from 'react'
import { Users, UserCheck, Droplets, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { api } from '../api'

import { Heart, Search } from 'lucide-react'

const BG_COLORS = {
  'A+': '#D71920', 'A-': '#E57373', 'B+': '#FF8A65', 'B-': '#FFCC80',
  'AB+': '#198754', 'AB-': '#81C784', 'O+': '#2196F3', 'O-': '#64B5F6',
}

export default function Overview({ username = 'User', onNavigate }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.overview().then(setData).catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div style={{ padding: 40, color: 'var(--accent)', textAlign: 'center' }}>
      <p style={{ fontSize: 16, marginBottom: 8, fontWeight: 700 }}>Could not connect to API</p>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>Start the backend: <code style={{ background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>python -m uvicorn api:app --reload</code></p>
    </div>
  )

  if (!data) return <Loading />

  const monthlyData = Object.entries(data.monthly_summary || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, units]) => ({ month: month.slice(5), units }))

  const bgData = Object.entries(data.blood_group_distribution || {})
    .map(([name, value]) => ({ name, value }))

  return (
    <div style={{ width: '100%' }}>
      {/* Red Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #D71920 0%, #B51217 100%)',
        borderRadius: 16,
        padding: '40px 48px',
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(215, 25, 32, 0.15)',
      }}>
        {/* Background visual decoration (grid or spots) */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />

        <div style={{ zIndex: 2 }}>
          <p style={{ fontSize: 13, color: '#FFD5D6', marginBottom: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Blood Donation Management
          </p>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#ffffff', marginBottom: 16, lineHeight: 1.2 }}>
            Be a <span style={{ color: '#FFC107' }}>Hero</span><br />
            Donate Blood<br />
            Save Lives
          </h2>
          <p style={{ fontSize: 14.5, color: '#FFE5E6', maxWidth: 460, marginBottom: 28, lineHeight: 1.6, fontWeight: 500 }}>
            Join India's largest blood donation community. Connect with verified donors, find blood in emergencies, and be the reason someone smiles today.
          </p>
          <div style={{ display: 'flex', gap: 14 }}>
            <button 
              onClick={() => onNavigate && onNavigate('Donor Registration')}
              style={{
                background: '#FFC107', color: '#212529', border: 'none',
                padding: '12px 24px', borderRadius: '30px', fontSize: '13.5px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(255,193,7,0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Heart size={15} fill="#212529" stroke="none" />
              Become a Donor
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('Find Donor')}
              style={{
                background: 'transparent', color: '#ffffff', border: '2px solid #ffffff',
                padding: '10px 24px', borderRadius: '30px', fontSize: '13.5px', fontWeight: '700',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Search size={15} />
              Find Blood
            </button>
          </div>
        </div>

        {/* Right graphic */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: 220, height: 220 }}>
          {/* Heartbeat pulse graphic in background */}
          <svg viewBox="0 0 200 100" width="280" height="140" style={{ position: 'absolute', opacity: 0.15, width: '130%', height: 'auto' }}>
            <path d="M0,50 L40,50 L50,20 L60,80 L70,40 L80,60 L90,50 L200,50" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Main drop */}
          <svg viewBox="0 0 100 120" width="140" height="168" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))', zIndex: 1 }}>
            <path d="M50,15 C50,15 82,62 82,88 A32,32 0 0,1 18,88 C18,62 50,15 50,15 Z" fill="#ffffff" />
            <path d="M50,98 C50,98 36,86 36,76 A10,10 0 0,1 50,68 A10,10 0 0,1 64,76 C64,86 50,98 50,98 Z" fill="#D71920" />
          </svg>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Total Donors"          value={data.total_donors}    icon={Users}         color="var(--accent)" />
        <StatCard label="Eligible to Donate"    value={data.eligible_donors} icon={UserCheck}     color="var(--accent2)" />
        <StatCard label="Blood Units Available" value={data.total_units}     icon={Droplets}      color="#0d6efd" />
        <StatCard label="Emergency Queue"       value={data.emergency_queue} icon={AlertTriangle} color={data.emergency_queue > 0 ? 'var(--accent)' : 'var(--accent2)'} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <Card>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Monthly Donations</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Units donated per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} width={40} label={{ value: 'Units Donated', angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ color: 'var(--text)', fontWeight: 600 }} itemStyle={{ color: 'var(--accent)' }} />
              <Area type="monotone" dataKey="units" stroke="var(--accent)" strokeWidth={2.5} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Blood Group Distribution</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Donors by blood group</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bgData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={42} paddingAngle={3}>
                {bgData.map((entry) => (
                  <Cell key={entry.name} fill={BG_COLORS[entry.name] || 'var(--muted)'} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ color: 'var(--text)', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent donations table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e9ecef' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Recent Donations</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donor ID</th>
                <th>Units</th>
                <th>Recipient</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_donations || []).map(r => (
                <tr key={r.record_id}>
                  <td>{r.donation_date}</td>
                  <td><code style={{ fontSize: 11, color: 'var(--text)', background: 'var(--surface2)', border: '1px solid #ffcdd2', padding: '3px 7px', borderRadius: 4 }}>{r.donor_id.slice(0, 8)}</code></td>
                  <td><Badge variant="blue">{r.units_donated} u</Badge></td>
                  <td style={{ color: 'var(--text)' }}>{r.recipient_details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div style={{ textAlign: 'center', color: 'var(--accent)' }}>
        <div style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite', border: '3px solid #ffcdd2', borderTopColor: 'var(--accent)', borderRadius: '50%', width: 32, height: 32, marginBottom: 12 }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)' }}>Loading Dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
