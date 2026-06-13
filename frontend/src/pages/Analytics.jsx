import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const BG_COLORS = {
  'A+': '#D71920', 'A-': '#E57373', 'B+': '#FF8A65', 'B-': '#FFCC80',
  'AB+': '#198754', 'AB-': '#81C784', 'O+': '#2196F3', 'O-': '#64B5F6',
}

const tooltipStyle = {
  contentStyle: { background: '#ffffff', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  labelStyle: { color: 'var(--text)', fontWeight: 600 },
  itemStyle: { color: 'var(--accent)' },
  cursor: { fill: 'rgba(0,0,0,0.02)' },
}

export default function Analytics() {
  const [overview, setOverview]     = useState(null)
  const [inventory, setInventory]   = useState([])

  useEffect(() => {
    api.overview().then(setOverview)
    api.inventory().then(setInventory)
  }, [])

  if (!overview) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading analytics...</div>

  const monthlyData = Object.entries(overview.monthly_summary || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, units]) => ({ month: month.slice(0, 7), units }))

  const bgData = Object.entries(overview.blood_group_distribution || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const invData = inventory.map(i => ({
    name: i.blood_group, units: i.available_units, status: i.expired ? 'Expired' : 'Valid',
  }))

  const totalDonors   = overview.total_donors
  const eligiblePct   = totalDonors > 0 ? Math.round(overview.eligible_donors / totalDonors * 100) : 0
  const totalUnits    = overview.total_units

  return (
    <div>
      <PageHeader title="Analytics" subtitle="System-wide blood donation insights" />

      {/* Summary KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Donors',       value: totalDonors,   color: '#4299e1' },
          { label: 'Eligibility Rate',   value: `${eligiblePct}%`, color: '#48bb78' },
          { label: 'Units in Stock',     value: totalUnits,    color: '#ed8936' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly trend + blood group donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Monthly Donation Trend</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Units donated over time</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} label={{ value: 'Month', position: 'insideBottom', offset: -10, fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} width={40} label={{ value: 'Units Donated', angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="units" stroke="var(--accent)" strokeWidth={2.5} fill="url(#mg)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Donor Blood Group Mix</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Distribution across {totalDonors} donors</p>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={bgData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={48} paddingAngle={3}>
                {bgData.map(entry => (
                  <Cell key={entry.name} fill={BG_COLORS[entry.name] || 'var(--muted)'} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Inventory bar + table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Inventory Status</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Available units per blood group</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={invData} barSize={40} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} label={{ value: 'Blood Group', position: 'insideBottom', offset: -10, fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} width={40} label={{ value: 'Units Available', angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                {invData.map((entry, i) => (
                  <Cell key={i} fill={entry.status === 'Expired' ? 'var(--accent)' : 'var(--accent2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e9ecef' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Donor Count by Blood Group</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Blood Group</th><th>Donors</th><th>Share</th></tr>
              </thead>
              <tbody>
                {bgData.map(({ name, value }) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 700, color: BG_COLORS[name] || 'var(--text)' }}>{name}</td>
                    <td style={{ color: 'var(--text)', fontWeight: 600 }}>{value}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 5, background: '#f1f3f5', borderRadius: 3 }}>
                          <div style={{ width: `${Math.round(value / totalDonors * 100)}%`, height: '100%', background: BG_COLORS[name] || '#6c757d', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{Math.round(value / totalDonors * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
