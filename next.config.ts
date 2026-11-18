import type { NextConfig } from "next";

// Cabeceras de seguridad para todas las respuestas (M13). No se fija una Content-Security-Policy completa: Next
// inserta scripts en línea para hidratar y una CSP estricta exigiría nonces en cada página (dinámicas todas);
// solo se usa `frame-ancestors` para impedir que otro sitio meta este dentro de un iframe (clickjacking).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Solo desarrollo: permite abrir `npm run dev` desde un celular de la misma red (http://<IP-de-tu-PC>:3000).
  // Sin esto Next 16 bloquea los recursos de desarrollo de ese origen, la página no se hidrata
  // y los componentes interactivos (p. ej. el menú móvil) no responden.
  allowedDevOrigins: ["192.168.*.*"],
  // No anunciar el framework en cada respuesta (`X-Powered-By: Next.js`).
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
