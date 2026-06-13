import { useState } from 'react'
import { HeartPulse, User, Lock, UserPlus, LogIn } from 'lucide-react'
import { login, signup } from '../auth'

export default function LoginPage({ onAuth }) {
  const [mode, setMode]       = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 300)) // brief visual feedback
    const result = mode === 'login'
      ? login(username, password)
      : signup(username, password)
    setLoading(false)
    if (result.ok) {
      onAuth(result.username)
    } else {
      setError(result.error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Background accent */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(215,25,32,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 6px 20px rgba(215,25,32,0.25)',
          }}>
            <HeartPulse size={28} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            Blood Donation
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '32px 28px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}>
          {/* Tab toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: 4, marginBottom: 28,
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
                background: mode === m ? 'var(--accent)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--muted)',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                transition: 'all .2s',
                textTransform: 'capitalize',
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="var(--muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: '#FFF5F5', color: 'var(--accent)',
                border: '1px solid #ffcdd2', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', fontSize: 14, fontWeight: 600,
              background: loading ? 'var(--surface2)' : 'var(--accent)',
              color: loading ? 'var(--muted)' : '#fff',
              border: 'none', borderRadius: 10, cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background .2s',
            }}>
              {loading ? (
                'Please wait...'
              ) : mode === 'login' ? (
                <><LogIn size={15} /> Sign In</>
              ) : (
                <><UserPlus size={15} /> Create Account</>
              )}
            </button>
          </form>

          {/* Hint */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
            {mode === 'login'
              ? <>No account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMode('signup'); setError('') }}>Sign up</span></>
              : <>Already have an account? <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMode('login'); setError('') }}>Sign in</span></>
            }
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 20 }}>
          SIC Hackathon 2026
        </p>
      </div>
    </div>
  )
}
