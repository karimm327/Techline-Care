import { IBM_Plex_Sans, JetBrains_Mono, Space_Grotesk } from "next/font/google";

// Polices « Ardoise » : titres, texte courant, code / références
export const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const classesPolices = `${display.variable} ${sans.variable} ${mono.variable}`;
