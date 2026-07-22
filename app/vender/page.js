"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function Vender() {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("general");
  const [detalles, setDetalles] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState(1);
  const [imagen, setImagen] = useState(null);
  const [generandoIA, setGenerandoIA] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function pedirDescripcionIA() {
    if (!titulo) {
      setError("Escribe primero el título del producto");
      return;
    }
    setError("");
    setGenerandoIA(true);
    try {
      const { respuesta } = await api.generarDescripcion(titulo, categoria, detalles);
      setDescripcion(respuesta);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerandoIA(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const producto = await api.crearProducto({
        titulo,
        descripcion,
        precio: parseFloat(precio),
        categoria,
        stock: parseInt(stock, 10),
      });
      if (imagen) {
        await api.subirImagen(producto.id, imagen);
      }
      router.push(`/productos/${producto.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1>Publicar producto</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          className="field"
          placeholder="Título del producto"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <input
          className="field"
          placeholder="Categoría (ej: tecnología, moda, hogar)"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
        <textarea
          className="field"
          placeholder="Detalles rápidos para que la IA escriba la descripción (opcional)"
          value={detalles}
          onChange={(e) => setDetalles(e.target.value)}
          rows={2}
        />
        <button
          type="button"
          className="btn"
          onClick={pedirDescripcionIA}
          disabled={generandoIA}
          style={{ marginBottom: 12, background: "#6c5ce7" }}
        >
          {generandoIA ? "Generando con IA..." : "✨ Generar descripción con Global AI"}
        </button>
        <textarea
          className="field"
          placeholder="Descripción del producto"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={4}
          required
        />
        <input
          className="field"
          type="number"
          step="0.01"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
        <input
          className="field"
          type="number"
          placeholder="Stock disponible"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
        <label style={{ display: "block", marginBottom: 12 }}>
          Imagen del producto:
          <input
            className="field"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </label>
        <button className="btn" disabled={cargando}>
          {cargando ? "Publicando..." : "Publicar producto"}
        </button>
      </form>
    </div>
  );
}
