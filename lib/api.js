/**
 * Cliente API centralizado. Todo el frontend habla con el backend
 * a través de estas funciones — así, si algo cambia en la API,
 * se arregla en un solo lugar.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
    throw new Error(err.detail || "Error en la petición");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  registro: (email, password, nombre) =>
    request("/users/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nombre }),
    }),

  login: async (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) throw new Error("Email o contraseña incorrectos");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    return data;
  },

  logout: () => localStorage.removeItem("token"),

  me: () => request("/users/me"),

  listarProductos: (categoria) =>
    request(`/products/${categoria ? `?categoria=${categoria}` : ""}`),

  obtenerProducto: (id) => request(`/products/${id}`),

  crearProducto: (producto) =>
    request("/products/", { method: "POST", body: JSON.stringify(producto) }),

  subirImagen: (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request(`/products/${productId}/imagen`, {
      method: "POST",
      body: formData,
    });
  },

  generarDescripcion: (titulo, categoria, detalles) =>
    request("/ai/generar-descripcion", {
      method: "POST",
      body: JSON.stringify({ titulo, categoria, detalles }),
    }),

  comprar: (productId, cantidad = 1) =>
    request("/orders/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, cantidad }),
    }),

  comprarConPaypal: (productId, cantidad = 1) =>
    request("/orders/paypal", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, cantidad }),
    }),

  capturarPagoPaypal: (orderId) =>
    request(`/orders/paypal/capturar?order_id=${orderId}`, { method: "POST" }),

  actualizarDatosBancarios: (datos) =>
    request("/users/me/banco", { method: "PATCH", body: JSON.stringify(datos) }),

  obtenerOrden: (orderId) => request(`/orders/${orderId}`),

  misOrdenes: () => request("/orders/me/todas"),

  ordenesRecibidas: () => request("/orders/vendedor/recibidas"),

  misProductos: () => request("/products/mios/todos"),

  editarProducto: (productId, cambios) =>
    request(`/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(cambios),
    }),

  eliminarProducto: (productId) =>
    request(`/products/${productId}`, { method: "DELETE" }),

  actualizarEstadoOrden: (orderId, estado) =>
    request(`/orders/${orderId}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),

  confirmarRecepcion: (orderId) =>
    request(`/orders/${orderId}/confirmar-recepcion`, { method: "PATCH" }),

  adminMarcarTransferido: (orderId) =>
    request(`/admin/ordenes/${orderId}/marcar-transferido`, { method: "PATCH" }),

  adminResumen: () => request("/admin/resumen"),
  adminUsuarios: () => request("/admin/usuarios"),
  adminProductos: () => request("/admin/productos"),
  adminOrdenes: () => request("/admin/ordenes"),

  adminEditarUsuario: (userId, cambios) =>
    request(`/admin/usuarios/${userId}`, { method: "PATCH", body: JSON.stringify(cambios) }),

  adminEliminarUsuario: (userId) =>
    request(`/admin/usuarios/${userId}`, { method: "DELETE" }),

  adminEditarProducto: (productId, cambios) =>
    request(`/admin/productos/${productId}`, { method: "PATCH", body: JSON.stringify(cambios) }),

  adminEliminarProducto: (productId) =>
    request(`/admin/productos/${productId}`, { method: "DELETE" }),

  adminEditarOrden: (orderId, cambios) =>
    request(`/admin/ordenes/${orderId}`, { method: "PATCH", body: JSON.stringify(cambios) }),

  imagenUrl: (path) => {
    if (!path) return null;
    // URLs de R2 ya vienen completas (https://...); las viejas del
    // disco local eran relativas (/uploads/...) y necesitaban el prefijo.
    return path.startsWith("http") ? path : `${API_URL}${path}`;
  },
};
