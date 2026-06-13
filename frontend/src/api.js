async function req(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  overview:          ()       => req('/api/overview'),
  donors:            ()       => req('/api/donors'),
  searchDonors:      (params) => req('/api/donors/search?' + new URLSearchParams(params)),
  createDonor:       (body)   => req('/api/donors', { method: 'POST', body: JSON.stringify(body) }),
  inventory:         ()       => req('/api/inventory'),
  addInventory:      (body)   => req('/api/inventory', { method: 'POST', body: JSON.stringify(body) }),
  emergency:         ()       => req('/api/emergency'),
  submitEmergency:   (body)   => req('/api/emergency', { method: 'POST', body: JSON.stringify(body) }),
  processEmergency:  ()       => req('/api/emergency/process', { method: 'POST' }),
  history:           (n = 20) => req(`/api/history?n=${n}`),
  donorHistory:      (id)     => req(`/api/history/${id}`),
  recordDonation:    (body)   => req('/api/history', { method: 'POST', body: JSON.stringify(body) }),
}
