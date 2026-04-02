import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow">

            <Link href="/" className="font-bold text-xl tracking-wide hover:text-gray-300">
                TechLine Care
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/demands" className="hover:text-gray-300">
                    Demandes
                </Link>

                <Link href="/login" className="hover:text-gray-300">
                    Connexion
                </Link>
            </div>

        </nav>
    );
}
