const BASE_URL = 'https://localhost:7192/api'

async function request(endpoint, options = {}) {
  // 1. Intentar buscar el token guardado en el navegador
  const token = localStorage.getItem('token');

  // 2. Preparar las cabeceras estándar
  const headers = { 
    'Content-Type': 'application/json' 
  };

  // 3. ¡EL TRUCO CLAVE! Si el token existe, meterlo en la cabecera de Autorización
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: headers, //  Inyectamos las cabeceras modificadas
    ...options,
  })

  // Para respuestas sin cuerpo (como los HTTP 204 de tus PUT o DELETE)
  if (response.status === 204) return null

  //  SEGURIDAD INVERSA: Si el backend responde 401 (Token inválido o expirado)
  if (response.status === 401) {
    localStorage.removeItem('token'); // Limpiamos el token viejo por seguridad
    window.location.href = '/login';   // Lo pateamos directo al Login de la app
    throw { status: 401, message: "Sesión expirada o no autorizada" };
  }

  const data = await response.json()

  if (!response.ok) {
    throw { status: response.status, data }
  }

  return data
}

const apiClient = {
  get:    (endpoint)       => request(endpoint),
  post:   (endpoint, body) => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body) => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),
  patch:  (endpoint, body) => request(endpoint, { method: 'PATCH',   body: body ? JSON.stringify(body) : undefined }),
}

export default apiClient