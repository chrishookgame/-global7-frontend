# Global 7 Market — Frontend (Sprint 2)

Next.js conectado al backend del Sprint 1. Incluye:

- Registro / login
- Explorar productos (home)
- Publicar producto, con imagen y botón de **Global AI** para generar la descripción
- Página de detalle de producto + botón de compra

## Cómo correrlo

1. Asegúrate de que el backend del Sprint 1 esté corriendo en `http://localhost:8000`
2. Instala dependencias:
   ```bash
   cd frontend
   npm install
   ```
3. Configura la URL de la API:
   ```bash
   cp .env.local.example .env.local
   ```
4. Corre el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre **http://localhost:3000**

## Flujo de prueba

1. Crea una cuenta en "Registrarme"
2. Ve a "Vender" y publica un producto — prueba el botón "✨ Generar descripción con Global AI"
3. Sube una imagen
4. Ve a "Explorar" y haz clic en tu producto
5. Presiona "Comprar" (el pago real se conecta en el Sprint 3)

## Nota sobre la base de datos

Si ya corriste el Sprint 1 antes de este sprint, tu tabla `products` no
tiene la columna `imagen_url` todavía (SQLAlchemy no altera tablas
existentes automáticamente). Para desarrollo, la forma más simple es
borrar y recrear la base:

```sql
DROP TABLE IF EXISTS order_items, orders, products, ai_interactions, users CASCADE;
```

Luego vuelve a correr el backend — las tablas se recrean solas con el
nuevo esquema. (En producción esto se maneja con migraciones de Alembic,
que agregamos más adelante en vez de borrar datos reales.)
