const BASE_URL = 'https://localhost:7192/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  // Para respuestas sin cuerpo (204)
  if (response.status === 204) return null

  const data = await response.json()

  if (!response.ok) {
    // Lanza el mensaje que manda el backend directamente
    throw { status: response.status, data }
  }

  return data
}

const apiClient = {
  get:    (endpoint)       => request(endpoint),
  post:   (endpoint, body) => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body) => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),
}

export default apiClient