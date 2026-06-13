const USERS_KEY = 'bdm_users'
const SESSION_KEY = 'bdm_session'

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Seed default users on first load
export function seedUsers() {
  const users = getUsers()
  const defaults = [
    { username: 'Rahul', password: '123' },
    { username: 'Jeel',  password: '123' },
  ]
  let changed = false
  for (const d of defaults) {
    if (!users.find(u => u.username.toLowerCase() === d.username.toLowerCase())) {
      users.push(d)
      changed = true
    }
  }
  if (changed) saveUsers(users)
}

export function login(username, password) {
  const users = getUsers()
  const user = users.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  )
  if (!user) return { ok: false, error: 'Invalid username or password.' }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username }))
  return { ok: true, username: user.username }
}

export function signup(username, password) {
  if (!username.trim() || !password) return { ok: false, error: 'Username and password required.' }
  if (password.length < 3) return { ok: false, error: 'Password must be at least 3 characters.' }
  const users = getUsers()
  if (users.find(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return { ok: false, error: 'Username already taken.' }
  }
  users.push({ username: username.trim(), password })
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: username.trim() }))
  return { ok: true, username: username.trim() }
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
