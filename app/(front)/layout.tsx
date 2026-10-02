import "../../styles/globals.css";
import type { ReactNode } from "react";
import { classesPolices } from "@/app/fonts";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/motion/MotionProvider";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={classesPolices}>
      <body className="min-h-screen flex flex-col bg-bg text-fg font-sans text-sm leading-normal antialiased selection:bg-accent/40">
        <MotionProvider>
          <Navbar />

          <main className="flex-1">{children}</main>

          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
