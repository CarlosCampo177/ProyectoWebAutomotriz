const BASE_URL = 'https://localhost:7192/api'  // ← confirma que es tu puerto

export async function get(endpoint) {
  const response = await fetch(`${BASE_URL}/${endpoint}`)
  if (!response.ok) throw new Error(`Error ${response.status}`)
  return response.json()
}

export async function post(endpoint, body) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Error ${response.status}`)
  return response.json()
}