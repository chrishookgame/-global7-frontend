"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";

function PagoExitosoPaypalContenido() {
  const params = useSearchParams();
  const orderId = params.get("order_id");
  const [estado, setEstado] = useState("procesando"); // procesando, pagado, error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    api
      .capturarPagoPaypal(orderId)
      .then((orden) => {
        setEstado(orden.estado === "pagado" ? "pagado" : "error");
      })
      .catch((e) => {
        setError(e.message);
        setEstado("error");
      });
  }, [orderId]);

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
      {estado === "procesando" && <p>Confirmando tu pago con PayPal...</p>}
      {estado === "pagado" && (
        <>
          <h1>✅ ¡Pago confirmado!</h1>
          <p>Tu compra fue pagada correctamente con PayPal.</p>
        </>
      )}
      {estado === "error" && (
        <>
          <h1>No pudimos confirmar el pago</h1>
          <p className="error">{error || "Intenta de nuevo o contáctanos si el problema sigue."}</p>
        </>
      )}
      <Link href="/" className="btn" style={{ display: "inline-block", marginTop: 20 }}>
        Volver al Marketplace
      </Link>
    </div>
  );
}

export default function PagoExitosoPaypal() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", marginTop: 60 }}>Cargando...</p>}>
      <PagoExitosoPaypalContenido />
    </Suspense>
  );
}
