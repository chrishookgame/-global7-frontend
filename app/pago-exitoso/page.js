"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";

function PagoExitosoContenido() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    // El webhook de Mercado Pago puede tardar un par de segundos en confirmar
    // el pago, así que reintentamos unas cuantas veces.
    let intentos = 0;
    const intervalo = setInterval(async () => {
      intentos++;
      try {
        const data = await api.obtenerOrden(orderId);
        setOrden(data);
        if (data.estado === "pagado" || intentos >= 8) {
          clearInterval(intervalo);
        }
      } catch (e) {
        setError(e.message);
        clearInterval(intervalo);
      }
    }, 1500);

    return () => clearInterval(intervalo);
  }, [orderId]);

  if (error) return <p className="error">{error}</p>;

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
      {!orden ? (
        <p>Confirmando tu pago...</p>
      ) : orden.estado === "pagado" ? (
        <>
          <h1>✅ ¡Pago confirmado!</h1>
          <p>Tu orden #{orden.id.slice(0, 8)} fue pagada correctamente.</p>
        </>
      ) : (
        <>
          <h1>Procesando tu pago...</h1>
          <p>Esto puede tardar unos segundos. No cierres esta página.</p>
        </>
      )}
      <Link href="/" className="btn" style={{ display: "inline-block", marginTop: 20 }}>
        Volver al Marketplace
      </Link>
    </div>
  );
}

export default function PagoExitoso() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", marginTop: 60 }}>Cargando...</p>}>
      <PagoExitosoContenido />
    </Suspense>
  );
}
