import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo desarrollo: permite abrir `npm run dev` desde un celular de la misma red (http://<IP-de-tu-PC>:3000).
  // Sin esto Next 16 bloquea los recursos de desarrollo de ese origen, la página no se hidrata
  // y los componentes interactivos (p. ej. el menú móvil) no responden.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
