import { useEffect, useState } from 'react'
import { Clock, Search } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const label = { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }

export default function History() {
  const [records, setRecords]    = useState([])
  const [form, setForm]          = useState({ donor_id: '', units_donated: 1, recipient_details: '', donation_date: new Date().toISOString().split('T')[0] })
  const [lookupId, setLookupId]  = useState('')
  const [lookupRes, setLookupRes]= useState(null)
  const [msg, setMsg]            = useState(null)
  const [n, setN]                = useState(20)

  const load = () => api.history(n).then(setRecords)
  useEffect(() => { load() }, [n])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.recordDonation({ ...form, units_donated: Number(form.units_donated) })
      setMsg({ ok: true, text: 'Donation recorded.' })
      setForm({ donor_id: '', units_donated: 1, recipient_details: '', donation_date: new Date().toISOString().split('T')[0] })
      load()
    } catch (err) { setMsg({ ok: false, text: err.message }) }
  }

  const lookup = async () => {
    if (!lookupId.trim()) return
    try { setLookupRes(await api.donorHistory(lookupId.trim())) }
    catch { setLookupRes([]) }
  }

  return (
    <div>
      <PageHeader title="Donation History" subtitle="Record and review blood donation activity" />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Record Donation</p>
            <form onSubmit={submit}>
              <div style={{ marginBottom: 14 }}>
                <label style={label}>Donor ID</label>
                <input value={form.donor_id} onChange={e => set('donor_id', e.target.value)} placeholder="8-char donor ID" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={label}>Units</label>
                  <input type="number" min={1} value={form.units_donated} onChange={e => set('units_donated', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>Date</label>
                  <input type="date" value={form.donation_date} onChange={e => set('donation_date', e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={label}>Recipient Details</label>
                <input value={form.recipient_details} onChange={e => set('recipient_details', e.target.value)} placeholder="Name / ward" />
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
                width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(215,25,32,0.15)'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Record Donation
              </button>
            </form>
          </Card>

          <Card>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>Donor Lookup</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="Donor ID" onKeyDown={e => e.key === 'Enter' && lookup()} />
              <button onClick={lookup} style={{
                padding: '9px 14px', background: '#ffffff', border: '1px solid #ced4da',
                borderRadius: 8, color: 'var(--accent)', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.2s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface2)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.borderColor = '#ced4da'
                }}
              >
                <Search size={14} />
              </button>
            </div>
            {lookupRes !== null && (
              <div style={{ marginTop: 12 }}>
                {lookupRes.length === 0
                  ? <p style={{ fontSize: 13, color: 'var(--muted)' }}>No records found.</p>
                  : lookupRes.slice(0, 5).map(r => (
                    <div key={r.record_id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)' }}>{r.donation_date}</span>
                        <Badge variant="blue">{r.units_donated} u</Badge>
                      </div>
                      <p style={{ color: 'var(--muted)', marginTop: 3 }}>{r.recipient_details}</p>
                    </div>
                  ))
                }
              </div>
            )}
          </Card>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Clock size={14} color="var(--muted)" /> Recent Donations
            </p>
            <select value={n} onChange={e => setN(Number(e.target.value))} style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}>
              {[10, 20, 50, 100].map(v => <option key={v} value={v}>Last {v}</option>)}
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Donor ID</th><th>Units</th><th>Recipient</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
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
    </div>
  )
}
