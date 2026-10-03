import path from "node:path";
import type { NextConfig } from "next";

const enDev = process.env.NODE_ENV !== "production";

// Politique de sécurité du contenu : tout vient du site lui-même (polices next/font auto-hébergées,
// photo dans public/). « unsafe-inline » reste nécessaire aux scripts d'amorçage de Next.js ;
// en développement, le rechargement à chaud a besoin d'eval et d'une websocket.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${enDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${enDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(enDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const enTetesSecurite = [
  { key: "Content-Security-Policy", value: csp },
  // Interdit l'affichage du site dans une iframe (anti « clickjacking »)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // HTTPS obligatoire pendant 2 ans (production uniquement : Render fournit le certificat)
  ...(enDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  // Le projet, c'est ce dossier (et pas C:\Users\user)
  turbopack: {
    root: path.join(__dirname),
  },
  // Ne pas annoncer la technologie du serveur
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: enTetesSecurite }];
  },
};

export default nextConfig;
