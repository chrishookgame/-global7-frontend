"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const ESTADO_LABEL = {
  pendiente: { texto: "Pendiente de pago", color: "#b8862e" },
  pagado: { texto: "Pagado — esperando envío", color: "#2f6e4e" },
  enviado: { texto: "Enviado", color: "#2e5c8a" },
  entregado: { texto: "Recepción confirmada", color: "#5a5548" },
};

export default function MisCompras() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [confirmando, setConfirmando] = useState(null);

  function cargar() {
    setCargando(true);
    api
      .misOrdenes()
      .then(setOrdenes)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarRecepcion(orderId) {
    setConfirmando(orderId);
    try {
      await api.confirmarRecepcion(orderId);
      cargar();
    } catch (e) {
      alert(e.message);
    } finally {
      setConfirmando(null);
    }
  }

  if (cargando) return <p>Cargando tus compras...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Mis compras</h1>
      {ordenes.length === 0 ? (
        <p style={{ color: "var(--ink-soft)" }}>Todavía no has comprado nada.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ordenes.map((o) => (
            <div key={o.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>Orden #{o.id.slice(0, 8)}</p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 13,
                      color: ESTADO_LABEL[o.estado]?.color || "var(--ink-soft)",
                    }}
                  >
                    {ESTADO_LABEL[o.estado]?.texto || o.estado}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>${o.total}</p>
                  {o.estado === "enviado" && (
                    <button
                      className="btn btn-gold"
                      style={{ marginTop: 8, padding: "8px 14px", fontSize: 13 }}
                      disabled={confirmando === o.id}
                      onClick={() => confirmarRecepcion(o.id)}
                    >
                      {confirmando === o.id ? "Confirmando..." : "Confirmar que llegó"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 24 }}>
        El vendedor recibe su pago recién después de que confirmes que el producto llegó
        correctamente — así protegemos tu compra.
      </p>
    </div>
  );
}
