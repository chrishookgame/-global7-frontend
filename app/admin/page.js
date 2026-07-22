"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

export default function Admin() {
  const [resumen, setResumen] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [pestana, setPestana] = useState("resumen");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [accionCargando, setAccionCargando] = useState(null);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [borrador, setBorrador] = useState({});

  function cargarTodo() {
    Promise.all([api.adminResumen(), api.adminUsuarios(), api.adminProductos(), api.adminOrdenes()])
      .then(([r, u, p, o]) => {
        setResumen(r);
        setUsuarios(u);
        setProductos(p);
        setOrdenes(o);
      })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  async function marcarTransferido(orderId) {
    setAccionCargando(orderId);
    try {
      await api.adminMarcarTransferido(orderId);
      cargarTodo();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(null);
    }
  }

  // ---------- Usuarios ----------
  function empezarEdicionUsuario(u) {
    setEditandoUsuario(u.id);
    setBorrador({ nombre: u.nombre, email: u.email, es_vendedor: u.es_vendedor, es_admin: u.es_admin });
  }

  async function guardarUsuario(userId) {
    setAccionCargando(userId);
    try {
      await api.adminEditarUsuario(userId, {
        ...borrador,
        es_vendedor: Number(borrador.es_vendedor),
        es_admin: Number(borrador.es_admin),
      });
      setEditandoUsuario(null);
      cargarTodo();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(null);
    }
  }

  async function eliminarUsuario(userId) {
    if (!confirm("¿Eliminar esta cuenta permanentemente? No se puede deshacer.")) return;
    setAccionCargando(userId);
    try {
      await api.adminEliminarUsuario(userId);
      cargarTodo();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(null);
    }
  }

  // ---------- Productos ----------
  function empezarEdicionProducto(p) {
    setEditandoProducto(p.id);
    setBorrador({ titulo: p.titulo, precio: p.precio, stock: p.stock, categoria: p.categoria });
  }

  async function guardarProducto(productId) {
    setAccionCargando(productId);
    try {
      await api.adminEditarProducto(productId, {
        ...borrador,
        precio: parseFloat(borrador.precio),
        stock: parseInt(borrador.stock, 10),
      });
      setEditandoProducto(null);
      cargarTodo();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(null);
    }
  }

  async function eliminarProducto(productId) {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    setAccionCargando(productId);
    try {
      await api.adminEliminarProducto(productId);
      cargarTodo();
    } catch (e) {
      alert(e.message);
    } finally {
      setAccionCargando(null);
    }
  }

  if (cargando) return <p>Cargando panel de administración...</p>;
  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        <p style={{ color: "var(--ink-soft)" }}>
          Si el error dice "Requiere permisos de administrador", tu cuenta todavía no está
          marcada como admin.
        </p>
      </div>
    );
  }

  const tabStyle = (activa) => ({
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
    background: activa ? "var(--navy-900)" : "transparent",
    color: activa ? "#fff" : "var(--ink)",
  });

  const btnPeq = { padding: "6px 12px", fontSize: 13 };
  const btnSecundario = { ...btnPeq, background: "transparent", color: "var(--navy-900)", border: "1px solid var(--line)" };
  const btnPeligro = { ...btnPeq, background: "transparent", color: "var(--error)", border: "1px solid var(--line)" };

  return (
    <div>
      <h1>Panel de administración</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={tabStyle(pestana === "resumen")} onClick={() => setPestana("resumen")}>Resumen</div>
        <div style={tabStyle(pestana === "usuarios")} onClick={() => setPestana("usuarios")}>Usuarios ({usuarios.length})</div>
        <div style={tabStyle(pestana === "productos")} onClick={() => setPestana("productos")}>Productos ({productos.length})</div>
        <div style={tabStyle(pestana === "ordenes")} onClick={() => setPestana("ordenes")}>Órdenes ({ordenes.length})</div>
      </div>

      {pestana === "resumen" && resumen && (
        <div className="grid">
          <div className="card">
            <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Usuarios totales</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>{resumen.total_usuarios}</p>
          </div>
          <div className="card">
            <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Productos publicados</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>{resumen.total_productos}</p>
          </div>
          <div className="card">
            <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Órdenes pagadas</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>{resumen.total_ordenes_pagadas}</p>
          </div>
          <div className="card">
            <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Total vendido</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0" }}>${resumen.total_vendido}</p>
          </div>
          <div className="card">
            <p style={{ color: "var(--ink-soft)", margin: 0, fontSize: 13 }}>Tu comisión acumulada</p>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "4px 0 0", color: "var(--gold-600)" }}>
              ${resumen.total_comision_plataforma}
            </p>
          </div>
        </div>
      )}

      {pestana === "usuarios" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {usuarios.map((u) =>
            editandoUsuario === u.id ? (
              <div key={u.id} className="card">
                <input className="field" value={borrador.nombre} onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })} placeholder="Nombre" />
                <input className="field" value={borrador.email} onChange={(e) => setBorrador({ ...borrador, email: e.target.value })} placeholder="Email" />
                <label style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={!!Number(borrador.es_vendedor)} onChange={(e) => setBorrador({ ...borrador, es_vendedor: e.target.checked ? 1 : 0 })} /> Es vendedor
                </label>
                <label style={{ display: "block", marginBottom: 12, fontSize: 13 }}>
                  <input type="checkbox" checked={!!Number(borrador.es_admin)} onChange={(e) => setBorrador({ ...borrador, es_admin: e.target.checked ? 1 : 0 })} /> Es administrador
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-gold" style={btnPeq} disabled={accionCargando === u.id} onClick={() => guardarUsuario(u.id)}>Guardar</button>
                  <button className="btn" style={btnSecundario} onClick={() => setEditandoUsuario(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div key={u.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{u.nombre}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>{u.email}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-soft)" }}>
                    {u.es_vendedor ? "Vendedor" : "Comprador"}{u.es_admin ? " · Admin" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" style={btnSecundario} onClick={() => empezarEdicionUsuario(u)}>Editar</button>
                  <button className="btn" style={btnPeligro} disabled={accionCargando === u.id} onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {pestana === "productos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {productos.map((p) =>
            editandoProducto === p.id ? (
              <div key={p.id} className="card">
                <input className="field" value={borrador.titulo} onChange={(e) => setBorrador({ ...borrador, titulo: e.target.value })} placeholder="Título" />
                <div style={{ display: "flex", gap: 10 }}>
                  <input className="field" type="number" step="0.01" value={borrador.precio} onChange={(e) => setBorrador({ ...borrador, precio: e.target.value })} placeholder="Precio" />
                  <input className="field" type="number" value={borrador.stock} onChange={(e) => setBorrador({ ...borrador, stock: e.target.value })} placeholder="Stock" />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-gold" style={btnPeq} disabled={accionCargando === p.id} onClick={() => guardarProducto(p.id)}>Guardar</button>
                  <button className="btn" style={btnSecundario} onClick={() => setEditandoProducto(null)}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div key={p.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{p.titulo}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
                    Vendedor: {p.vendedor_email} · Stock: {p.stock}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>${p.precio}</p>
                  <button className="btn" style={btnSecundario} onClick={() => empezarEdicionProducto(p)}>Editar</button>
                  <button className="btn" style={btnPeligro} disabled={accionCargando === p.id} onClick={() => eliminarProducto(p.id)}>Eliminar</button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {pestana === "ordenes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ordenes.map((o) => (
            <div key={o.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{o.producto_titulo}</p>
                <p style={{ margin: 0, fontWeight: 600 }}>${o.total}</p>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-soft)" }}>
                Comprador: {o.comprador_email} · Vendedor: {o.vendedor_email} · Estado: {o.estado}
              </p>
              {o.estado !== "pendiente" && (
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                  Tu comisión: <strong>${o.comision_plataforma}</strong> · A transferir al vendedor:{" "}
                  <strong>${o.monto_vendedor}</strong>
                </p>
              )}

              {o.estado === "entregado" && !o.transferido_vendedor && (
                <div style={{ marginTop: 10, padding: 10, background: "var(--gold-100)", borderRadius: 6 }}>
                  <p style={{ fontSize: 13, margin: "0 0 8px" }}>
                    ✅ Comprador confirmó recepción — lista para pagar al vendedor
                  </p>
                  {o.vendedor_banco_numero_cuenta ? (
                    <p style={{ fontSize: 13, margin: "0 0 10px", color: "var(--ink-soft)" }}>
                      Transferir a: {o.vendedor_banco_nombre} · {o.vendedor_banco_tipo_cuenta} ·{" "}
                      {o.vendedor_banco_numero_cuenta} · {o.vendedor_banco_rut} · {o.vendedor_banco_titular}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, margin: "0 0 10px", color: "var(--error)" }}>
                      ⚠️ Este vendedor todavía no registró sus datos bancarios — pídeselos antes de transferir.
                    </p>
                  )}
                  <button className="btn btn-gold" style={btnPeq} disabled={accionCargando === o.id} onClick={() => marcarTransferido(o.id)}>
                    Marcar como transferido
                  </button>
                </div>
              )}
              {o.transferido_vendedor === 1 && (
                <p style={{ marginTop: 8, fontSize: 13, color: "var(--success)" }}>✓ Ya le transferiste el pago al vendedor</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
