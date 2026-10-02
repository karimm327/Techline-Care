import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le projet, c'est ce dossier (et pas C:\Users\user)
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
