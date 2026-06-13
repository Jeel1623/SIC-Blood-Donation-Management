import { useEffect, useState } from 'react'
import { AlertTriangle, Play } from 'lucide-react'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { api } from '../api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const label = { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5 }

const PRIORITY_LABELS = { 1: 'Critical', 2: 'Urgent', 3: 'Normal' }
const PRIORITY_VARIANT = { 1: 'red', 2: 'yellow', 3: 'green' }

export default function Emergency() {
  const [queue, setQueue]   = useState([])
  const [form, setForm]     = useState({ blood_group: 'A+', units_needed: 2, hospital: '', contact: '', priority: 2 })
  const [msg, setMsg]       = useState(null)
  const [loading, setLoad]  = useState(false)

  const load = () => api.emergency().then(setQueue)
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.hospital.trim() || !form.contact.trim()) { setMsg({ ok: false, text: 'Hospital and contact required.' }); return }
    try {
      await api.submitEmergency({ ...form, units_needed: Number(form.units_needed), priority: Number(form.priority) })
      setMsg({ ok: true, text: 'Request submitted to queue.' })
      setForm({ blood_group: 'A+', units_needed: 2, hospital: '', contact: '', priority: 2 })
      load()
    } catch (err) { setMsg({ ok: false, text: err.message }) }
  }

  const processNext = async () => {
    setLoad(true)
    try {
      const result = await api.processEmergency()
      setMsg({ ok: result.fulfilled, text: result.fulfilled
        ? `Fulfilled: ${result.hospital} received ${result.blood_group} units.`
        : `Insufficient stock for ${result.hospital} (${result.blood_group}).`
      })
      load()
    } catch (err) { setMsg({ ok: false, text: err.message }) }
    setLoad(false)
  }

  return (
    <div>
      <PageHeader
        title="Emergency Requests"
        subtitle="Submit and manage urgent blood requests"
        action={
          <button onClick={processNext} disabled={loading || queue.length === 0} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', background: queue.length > 0 ? 'var(--accent)' : '#f1f3f5',
            color: queue.length > 0 ? '#fff' : 'var(--muted)',
            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
            cursor: queue.length === 0 || loading ? 'default' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: queue.length > 0 ? '0 4px 12px rgba(215,25,32,0.15)' : 'none'
          }}
            onMouseEnter={e => { if (queue.length > 0) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { if (queue.length > 0) e.currentTarget.style.background = 'var(--accent)' }}
          >
            <Play size={14} fill={queue.length > 0 ? '#fff' : 'var(--muted)'} stroke="none" />
            Process Next ({queue.length})
          </button>
        }
      />

      {/* Red Warning Banner */}
      {queue.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #D71920 0%, #B51217 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: 12,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 15px rgba(215,25,32,0.15)',
        }}>
          <AlertTriangle size={24} color="#FFC107" strokeWidth={2.5} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 15, display: 'block' }}>CRITICAL ALERT: {queue.length} Pending Emergency Requests</strong>
            <p style={{ fontSize: 13, margin: '2px 0 0', opacity: 0.9 }}>Immediate action required. Process requests to dispatch blood units from available inventory.</p>
          </div>
        </div>
      )}

      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13.5, fontWeight: 600,
          background: msg.ok ? '#E8F5E9' : '#FFF5F5',
          color: msg.ok ? 'var(--accent2)' : 'var(--accent)',
          border: `1px solid ${msg.ok ? '#c8e6c9' : '#ffcdd2'}`,
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        <Card>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text)' }}>
            <AlertTriangle size={15} color="var(--accent)" /> Submit Request
          </p>
          <form onSubmit={submit}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={label}>Blood Group</label>
                <select value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                  {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={label}>Units Needed</label>
                <input type="number" min={1} value={form.units_needed} onChange={e => set('units_needed', e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Hospital Name</label>
              <input value={form.hospital} onChange={e => set('hospital', e.target.value)} placeholder="e.g. Apollo Hospital" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>Contact Number</label>
              <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="+91 9999999999" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={label}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', Number(e.target.value))}>
                <option value={1}>1 — Critical</option>
                <option value={2}>2 — Urgent</option>
                <option value={3}>3 — Normal</option>
              </select>
            </div>
            <button type="submit" style={{
              width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(215,25,32,0.15)'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              Submit Request
            </button>
          </form>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Pending Queue</p>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', background: 'var(--surface2)', padding: '3px 10px', borderRadius: 20 }}>
              {queue.length} requests
            </span>
          </div>
          {queue.length === 0
            ? <p style={{ padding: 24, color: 'var(--muted)', fontSize: 13.5 }}>Queue is empty.</p>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Priority</th><th>Blood Group</th><th>Units</th><th>Hospital</th><th>Contact</th></tr>
                  </thead>
                  <tbody>
                    {queue.map(r => (
                      <tr key={r.request_id}>
                        <td><Badge variant={PRIORITY_VARIANT[r.priority]}>{PRIORITY_LABELS[r.priority]}</Badge></td>
                        <td><Badge variant="red">{r.blood_group}</Badge></td>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{r.units_needed}</td>
                        <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r.hospital}</td>
                        <td style={{ color: 'var(--text)' }}>{r.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </Card>
      </div>
    </div>
  )
}
