"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Nav() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    api.me().then(setUsuario).catch(() => setUsuario(null));
  }, []);

  function salir() {
    api.logout();
    window.location.href = "/";
  }

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 28px",
          background: "#fff",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="Global 7 AI Ecosystem" style={{ height: 34 }} />
        </Link>
        <div style={{ display: "flex", gap: 22, alignItems: "center", fontSize: 15 }}>
          <Link href="/">Explorar</Link>
          {usuario ? (
            <>
              <Link href="/vender">Vender</Link>
              <Link href="/compras">Mis compras</Link>
              <Link href="/panel">Mi panel</Link>
              {usuario.es_admin === 1 && <Link href="/admin">Admin</Link>}
              <span style={{ color: "var(--ink-soft)" }}>Hola, {usuario.nombre}</span>
              <button className="btn" onClick={salir}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/registro" className="btn btn-gold">
                Registrarme
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="circuit-divider" />
    </>
  );
}
