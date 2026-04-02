import "../../styles/globals.css";
import {ReactNode} from "react";
import Navbar from "@/components/Navbar";

export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="fr">
        <body>
        <Navbar/>
        <main>{children}</main>
        </body>
        </html>
    );
}
