import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ruta B2B Platform",
  description: "Sistema web profesional para venta por ruta sin almacén",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
