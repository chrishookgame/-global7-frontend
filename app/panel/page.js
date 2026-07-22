"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

const ESTADO_LABEL = {
  pendiente: { texto: "Pendiente de pago", color: "#b8862e" },
  pagado: { texto: "Pagado", color: "#2f6e4e" },
  enviado: { texto: "Enviado — esperando confirmación del comprador", color: "#2e5c8a" },
  entregado: { texto: "Comprador confirmó recepción", color: "#5a5548" },
};

export default function Panel() {
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null); // id del producto en edición
  const [borrador, setBorrador] = useState({});
  const [accionCargando, setAccionCargando] = useState(false);
  const [datosBancarios, setDatosBancarios] = useState({
    banco_nombre: "",
    banco_tipo_cuenta: "",
    banco_numero_cuenta: "",
    banco_rut: "",
    banco_titular: "",
  });
  const [editandoBanco, setEditandoBanco] = useState(false);
  const [guardandoBanco, setGuardandoBanco] = useState(false);

  function cargarDatos() {
    setCargando(true);
    Promise.all([api.misProductos(), api.ordenesRecibidas(), api.me()])
      .then(([p, o, usuario]) => {
        setProductos(p);
        setOrdenes(o);
        setDatosBancarios({
          banco_nombre: usuario.banco_nombre || "",
          banco_tipo_cuenta: usuario.banco_tipo_cuenta || "",
          banco_numero_cuenta: usuario.banco_numero_cuenta || "",
          banco_rut: usuario.banco_rut || "",
          banco_titular: usuario.banco_titular || "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }

  async function guardarDatosBancarios() {
    setGuardandoBanco(true);
    try {
      await api.actualizarDatosBancarios(datosBancarios);
      setEditandoBanco(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardandoBanco(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function marcarEnviado(orderId) {
    setAccionCargando(true);
    try {
      await api.actualizarEstadoOrden(orderId, "enviado");
      cargarDatos();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(false);
    }
  }

  function empezarEdicion(producto) {
    setEditando(producto.id);
    setBorrador({
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
    });
  }

  async function guardarEdicion(productId) {
    setAccionCargando(true);
    try {
      await api.editarProducto(productId, {
        ...borrador,
        precio: parseFloat(borrador.precio),
        stock: parseInt(borrador.stock, 10),
      });
      setEditando(null);
      cargarDatos();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(false);
    }
  }

  async function eliminarProducto(productId) {
    if (!confirm("¿Seguro que quieres eliminar este producto? No se puede deshacer.")) return;
    setAccionCargando(true);
    try {
      await api.eliminarProducto(productId);
      cargarDatos();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(false);
    }
  }

  if (cargando) return <p>Cargando tu panel...</p>;
  if (error) return <p className="error">{error}</p>;

  const ventasConfirmadas = ordenes.filter((o) => o.estado !== "pendiente");
  const totalVendido = ventasConfirmadas.reduce((acc, o) => acc + o.total, 0);

  return (
    <div>
      <h1>Tu panel de vendedor</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Productos publicados</p>
          <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>{productos.length}</p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Ventas confirmadas</p>
          <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>
            {ventasConfirmadas.length}
          </p>
        </div>
        <div className="card" style={{ flex: 1 }}>
          <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Total vendido</p>
          <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>
            ${totalVendido.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Tus datos bancarios</h2>
          {!editandoBanco && (
            <button
              className="btn"
              style={{ padding: "8px 14px", fontSize: 13, background: "transparent", color: "var(--navy-900)", border: "1px solid var(--line)" }}
              onClick={() => setEditandoBanco(true)}
            >
              {datosBancarios.banco_numero_cuenta ? "Editar" : "Agregar datos bancarios"}
            </button>
          )}
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "6px 0 16px" }}>
          Así sabemos a qué cuenta transferirte tu parte de cada venta.
        </p>

        {editandoBanco ? (
          <div>
            <input
              className="field"
              placeholder="Banco (ej: Banco de Chile)"
              value={datosBancarios.banco_nombre}
              onChange={(e) => setDatosBancarios({ ...datosBancarios, banco_nombre: e.target.value })}
            />
            <input
              className="field"
              placeholder="Tipo de cuenta (ej: Cuenta Corriente)"
              value={datosBancarios.banco_tipo_cuenta}
              onChange={(e) => setDatosBancarios({ ...datosBancarios, banco_tipo_cuenta: e.target.value })}
            />
            <input
              className="field"
              placeholder="Número de cuenta"
              value={datosBancarios.banco_numero_cuenta}
              onChange={(e) => setDatosBancarios({ ...datosBancarios, banco_numero_cuenta: e.target.value })}
            />
            <input
              className="field"
              placeholder="RUT"
              value={datosBancarios.banco_rut}
              onChange={(e) => setDatosBancarios({ ...datosBancarios, banco_rut: e.target.value })}
            />
            <input
              className="field"
              placeholder="Nombre del titular de la cuenta"
              value={datosBancarios.banco_titular}
              onChange={(e) => setDatosBancarios({ ...datosBancarios, banco_titular: e.target.value })}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-gold" disabled={guardandoBanco} onClick={guardarDatosBancarios}>
                {guardandoBanco ? "Guardando..." : "Guardar"}
              </button>
              <button
                className="btn"
                style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--line)" }}
                onClick={() => setEditandoBanco(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : datosBancarios.banco_numero_cuenta ? (
          <p style={{ fontSize: 14, margin: 0 }}>
            {datosBancarios.banco_nombre} · {datosBancarios.banco_tipo_cuenta} ·{" "}
            {datosBancarios.banco_numero_cuenta} · {datosBancarios.banco_rut} ·{" "}
            {datosBancarios.banco_titular}
          </p>
        ) : (
          <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>
            Todavía no has registrado tus datos bancarios.
          </p>
        )}
      </div>

      <h2>Órdenes recibidas</h2>
      {ordenes.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>
          Todavía no has recibido ninguna compra. Comparte tus productos para empezar a vender.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
          {ordenes.map((o) => (
            <div
              key={o.id}
              className="card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{o.producto_titulo}</p>
                <p style={{ margin: "4px 0 0", color: "var(--ink-soft)", fontSize: 13 }}>
                  Comprador: {o.comprador_email} · Cantidad: {o.cantidad}
                </p>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>${o.total}</p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: ESTADO_LABEL[o.estado]?.color || "var(--ink-soft)",
                    }}
                  >
                    {ESTADO_LABEL[o.estado]?.texto || o.estado}
                  </p>
                </div>
                {o.estado === "pagado" && (
                  <button
                    className="btn"
                    style={{ padding: "8px 14px", fontSize: 13 }}
                    disabled={accionCargando}
                    onClick={() => marcarEnviado(o.id)}
                  >
                    Marcar enviado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Tus productos</h2>
      {productos.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>
          No has publicado productos todavía.{" "}
          <Link href="/vender" style={{ textDecoration: "underline" }}>
            Publica el primero
          </Link>
          .
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {productos.map((p) =>
            editando === p.id ? (
              <div key={p.id} className="card">
                <input
                  className="field"
                  value={borrador.titulo}
                  onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })}
                  placeholder="Título"
                />
                <textarea
                  className="field"
                  value={borrador.descripcion}
                  onChange={(e) => setBorrador({ ...borrador, descripcion: e.target.value })}
                  placeholder="Descripción"
                  rows={3}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="field"
                    type="number"
                    step="0.01"
                    value={borrador.precio}
                    onChange={(e) => setBorrador({ ...borrador, precio: e.target.value })}
                    placeholder="Precio"
                  />
                  <input
                    className="field"
                    type="number"
                    value={borrador.stock}
                    onChange={(e) => setBorrador({ ...borrador, stock: e.target.value })}
                    placeholder="Stock"
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="btn btn-gold"
                    disabled={accionCargando}
                    onClick={() => guardarEdicion(p.id)}
                  >
                    Guardar cambios
                  </button>
                  <button
                    className="btn"
                    style={{ background: "transparent", color: "var(--ink)", border: "1px solid var(--line)" }}
                    onClick={() => setEditando(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={p.id}
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {p.imagen_url && (
                    <img
                      src={api.imagenUrl(p.imagen_url)}
                      alt={p.titulo}
                      style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                    />
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>{p.titulo}</p>
                    <p style={{ margin: "4px 0 0", color: "var(--ink-soft)", fontSize: 13 }}>
                      Stock: {p.stock} · ${p.precio}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn"
                    style={{ padding: "8px 14px", fontSize: 13, background: "transparent", color: "var(--navy-900)", border: "1px solid var(--line)" }}
                    onClick={() => empezarEdicion(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn"
                    style={{ padding: "8px 14px", fontSize: 13, background: "transparent", color: "var(--error)", border: "1px solid var(--line)" }}
                    disabled={accionCargando}
                    onClick={() => eliminarProducto(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
