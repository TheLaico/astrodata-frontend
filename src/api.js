const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get baseUrl() {
    return API_URL;
  },
  status: () => request("/status"),
  stats: () => request("/stats"),
  healthFull: () => request("/health/full"),
  dbPing: () => request("/db/ping"),
  dbQuery: (payload) =>
    request("/db/query", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listObjects: (tipo) =>
    request(`/objetos-celestes?limite=100${tipo ? `&tipo_objeto=${tipo}` : ""}`),
  createObject: (payload) =>
    request("/objetos-celestes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateObject: (id, payload) =>
    request(`/objetos-celestes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteObject: (id) =>
    request(`/objetos-celestes/${id}`, {
      method: "DELETE",
    }),
  listDocuments: () => request("/documentos?limite=20"),
  search: (q) => request(`/busqueda?q=${encodeURIComponent(q)}&limite=10`),
  ask: (pregunta) =>
    request("/chat/preguntar", {
      method: "POST",
      body: JSON.stringify({ pregunta }),
    }),
  history: () => request("/chat/historial?limite=10"),
  clearHistory: () =>
    request("/chat/historial", {
      method: "DELETE",
    }),
};
