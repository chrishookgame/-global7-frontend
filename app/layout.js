import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Global 7 AI Ecosystem",
  description: "Un solo lugar para comprar, vender, aprender, trabajar y crecer.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        <main style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 20px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
