import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const inputRow = { display: 'flex', gap: 12, marginBottom: 14 }
const label = { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }

export default function Donors() {
  const [donors, setDonors]   = useState([])
  const [form, setForm]       = useState({ name: '', age: 25, blood_group: 'A+', city: '', last_donation_date: '' })
  const [msg, setMsg]         = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => api.donors().then(setDonors)
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.city.trim()) { setMsg({ ok: false, text: 'Name and City required.' }); return }
    setLoading(true)
    try {
      const donor = await api.createDonor({ ...form, age: Number(form.age), last_donation_date: form.last_donation_date || null })
      setMsg({ ok: true, text: `Registered ${donor.name} — ID: ${donor.donor_id}` })
      setForm({ name: '', age: 25, blood_group: 'A+', city: '', last_donation_date: '' })
      load()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
    setLoading(false)
  }

  return (
    <div>
      <PageHeader title="Register Donor" subtitle="Add new blood donors to the system" />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        <Card>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>New Donor</p>
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Arun Kumar" />
            </div>
            <div style={inputRow}>
              <div style={{ flex: 1 }}>
                <label style={label}>Age</label>
                <input type="number" min={18} max={65} value={form.age} onChange={e => set('age', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Blood Group</label>
                <select value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                  {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Chennai" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Last Donation Date (leave blank if first-time)</label>
              <input type="date" value={form.last_donation_date} onChange={e => set('last_donation_date', e.target.value)} />
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

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14,
              opacity: loading ? .7 : 1, cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(215,25,32,0.15)'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              <UserPlus size={15} style={{ marginRight: 7, verticalAlign: 'middle' }} />
              {loading ? 'Registering...' : 'Register Donor'}
            </button>
          </form>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>All Donors</p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{donors.length} registered</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Blood</th>
                  <th>City</th>
                  <th>Last Donation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(d => (
                  <tr key={d.donor_id}>
                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                    <td style={{ color: 'var(--muted)' }}>{d.age}</td>
                    <td><Badge variant="red">{d.blood_group}</Badge></td>
                    <td style={{ color: 'var(--muted)', textTransform: 'capitalize' }}>{d.city}</td>
                    <td style={{ color: 'var(--muted)' }}>{d.last_donation_date || '—'}</td>
                    <td><Badge variant={d.eligible ? 'green' : 'grey'}>{d.eligible ? 'Eligible' : 'Ineligible'}</Badge></td>
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
