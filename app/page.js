"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/api";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listarProductos()
      .then(setProductos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p>Cargando productos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <p
          style={{
            color: "var(--gold-600)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "0 0 6px",
          }}
        >
          Global 7 AI Ecosystem
        </p>
        <h1 style={{ fontSize: 36, margin: "0 0 8px" }}>Un solo lugar para comprar y vender</h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 16, maxWidth: 560, margin: 0 }}>
          Publica en minutos con ayuda de IA, compra con pago seguro. Así de simple.
        </p>
      </div>
      {productos.length === 0 ? (
        <p>Todavía no hay productos publicados. ¡Sé el primero en vender!</p>
      ) : (
        <div className="grid">
          {productos.map((p) => (
            <Link key={p.id} href={`/productos/${p.id}`} className="card">
              {p.imagen_url && (
                <img
                  src={api.imagenUrl(p.imagen_url)}
                  alt={p.titulo}
                  style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }}
                />
              )}
              <h3 style={{ margin: "12px 0 4px", fontSize: 17 }}>{p.titulo}</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "0 0 8px" }}>{p.categoria}</p>
              <p style={{ fontWeight: 600, color: "var(--navy-900)" }}>${p.precio}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
