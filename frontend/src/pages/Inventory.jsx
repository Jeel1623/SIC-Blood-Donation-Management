import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const label = { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }

export default function Inventory() {
  const [items, setItems] = useState([])
  const [form, setForm]   = useState({ blood_group: 'A+', units: 10, expiry_date: '' })
  const [msg, setMsg]     = useState(null)

  const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear() + 1)
  const defaultExpiry = nextYear.toISOString().split('T')[0]

  const load = () => api.inventory().then(setItems)
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.addInventory({ ...form, units: Number(form.units), expiry_date: form.expiry_date || defaultExpiry })
      setMsg({ ok: true, text: 'Inventory updated.' })
      load()
    } catch (err) { setMsg({ ok: false, text: err.message }) }
  }

  const chartData = items.map(i => ({
    name: i.blood_group, units: i.available_units, expired: i.expired,
  }))

  return (
    <div>
      <PageHeader title="Blood Inventory" subtitle="Track and manage available blood units" />

      {/* Blood Stock Cards Grid */}
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: 'var(--text)' }}>Blood Stock Overview</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {BLOOD_GROUPS.map(bg => {
          const item = items.find(i => i.blood_group === bg) || { blood_group: bg, available_units: 0, expired: false };
          const maxCapacity = 50;
          const percent = Math.min((item.available_units / maxCapacity) * 100, 100);
          const lowStock = item.available_units < 10;
          
          let statusColor = 'var(--accent)';
          if (item.expired) statusColor = 'var(--muted)';
          else if (!lowStock) statusColor = 'var(--accent2)';
          else statusColor = 'var(--accent3)';

          return (
            <Card key={bg} style={{ borderTop: `4px solid ${statusColor}`, display: 'flex', flexDirection: 'column', gap: 14, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)' }}>{bg}</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34 }}>
                  <svg viewBox="0 0 100 120" width="22" height="26">
                    <path d="M50,15 C50,15 82,62 82,88 A32,32 0 0,1 18,88 C18,62 50,15 50,15 Z" fill={item.expired ? '#6c757d' : 'var(--accent)'} />
                  </svg>
                  {item.expired && <span style={{ position: 'absolute', fontSize: 8, color: '#fff', fontWeight: 'bold', top: 12 }}>x</span>}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                  {item.available_units} Units Available
                </div>
                {item.expired && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Contains expired units</span>}
                {lowStock && !item.expired && <span style={{ fontSize: 11, color: '#B78103', fontWeight: 600 }}>Low Stock Alert</span>}
              </div>
              
              <div>
                <div style={{ width: '100%', height: 8, background: '#f1f3f5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: statusColor, borderRadius: 4, transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
                  <span>0</span>
                  <span>{maxCapacity}+ max</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, marginBottom: 24 }}>
        <Card>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>Add Units</p>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Blood Group</label>
              <select value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Units to Add</label>
              <input type="number" min={1} value={form.units} onChange={e => set('units', e.target.value)} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Expiry Date</label>
              <input type="date" value={form.expiry_date || defaultExpiry} onChange={e => set('expiry_date', e.target.value)} />
            </div>
            {msg && (
              <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13,
                background: msg.ok ? '#E8F5E9' : '#FFF5F5',
                color: msg.ok ? 'var(--accent2)' : 'var(--accent)',
                border: `1px solid ${msg.ok ? '#c8e6c9' : '#ffcdd2'}`,
                fontWeight: 600,
              }}>
                {msg.text}
              </div>
            )}
            <button type="submit" style={{
              width: '100%', padding: '10px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(215,25,32,0.15)'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              Add Units
            </button>
          </form>
        </Card>

        <Card>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>Units by Blood Group</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Green = valid, Red = expired</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={40} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} label={{ value: 'Blood Group', position: 'insideBottom', offset: -10, fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={{ stroke: '#e9ecef' }} tickLine={{ stroke: '#e9ecef' }} width={40} label={{ value: 'Units Available', angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e9ecef', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} labelStyle={{ color: 'var(--text)', fontWeight: 600 }} itemStyle={{ color: 'var(--text)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.expired ? 'var(--accent)' : 'var(--accent2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e9ecef' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Full Inventory Details</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Blood Group</th><th>Available Units</th><th>Expiry Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.sort((a, b) => a.blood_group.localeCompare(b.blood_group)).map(item => (
                <tr key={item.blood_group}>
                  <td><strong>{item.blood_group}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 160, height: 6, background: '#f1f3f5', borderRadius: 3 }}>
                        <div style={{ width: `${Math.min(item.available_units / 50 * 100, 100)}%`, height: '100%', background: item.expired ? 'var(--accent)' : 'var(--accent2)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>{item.available_units}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text)' }}>{item.expiry_date}</td>
                  <td>
                    <Badge variant={item.expired ? 'red' : item.available_units < 10 ? 'yellow' : 'green'}>
                      {item.expired ? 'Expired' : item.available_units < 10 ? 'Low Stock' : 'OK'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
