"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../lib/api";

export default function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState("");
  const [comprando, setComprando] = useState(false);

  useEffect(() => {
    api
      .obtenerProducto(id)
      .then(setProducto)
      .catch((e) => setError(e.message));
  }, [id]);

  async function comprarConMercadoPago() {
    setError("");
    setComprando(true);
    try {
      const { checkout_url } = await api.comprar(id, 1);
      window.location.href = checkout_url;
    } catch (e) {
      setError(e.message);
      setComprando(false);
    }
  }

  async function comprarConPaypal() {
    setError("");
    setComprando(true);
    try {
      const { approve_url } = await api.comprarConPaypal(id, 1);
      window.location.href = approve_url;
    } catch (e) {
      setError(e.message);
      setComprando(false);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!producto) return <p>Cargando...</p>;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {producto.imagen_url && (
        <img
          src={api.imagenUrl(producto.imagen_url)}
          alt={producto.titulo}
          style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 12 }}
        />
      )}
      <h1>{producto.titulo}</h1>
      <p style={{ color: "var(--ink-soft)" }}>{producto.categoria}</p>
      <p>{producto.descripcion}</p>
      <p style={{ fontSize: 24, fontWeight: 700 }}>${producto.precio}</p>
      <p style={{ color: producto.stock > 0 ? "var(--success)" : "var(--error)" }}>
        {producto.stock > 0 ? `${producto.stock} disponibles` : "Sin stock"}
      </p>

      {error && <p className="error">{error}</p>}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn" onClick={comprarConMercadoPago} disabled={comprando || producto.stock === 0}>
          {comprando ? "Procesando..." : "Comprar con Mercado Pago"}
        </button>
        <button
          className="btn"
          style={{ background: "#003087" }}
          onClick={comprarConPaypal}
          disabled={comprando || producto.stock === 0}
        >
          {comprando ? "Procesando..." : "Pagar con PayPal"}
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10 }}>
        Pagando con PayPal, el monto se convierte automáticamente a dólares al tipo de cambio del día.
      </p>
    </div>
  );
}
