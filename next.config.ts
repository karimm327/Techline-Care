import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    // Le projet, c'est ce dossier (et pas C:\Users\user)
    turbopack: {
        root: path.join(__dirname),
    },
};

export default nextConfig;
