const BASE_URL = "https://localhost:7192/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: headers, //  Inyectamos las cabeceras modificadas
    ...options,
  });

  if (response.status === 204) return null;

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data"); // ← también limpia el usuario
    window.location.href = "/page/login"; // ← ruta correcta
    throw { status: 401, message: "Sesión expirada o no autorizada" };
  }

  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

const apiClient = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
  patch: (endpoint, body) =>
    request(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export default apiClient;
