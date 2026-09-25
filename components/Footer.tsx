export default function Footer() {
    return (
        <footer className="border-t bg-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    <div>
                        <p className="font-semibold text-gray-800">
                            TechLine Care
                        </p>
                        <p className="text-sm text-gray-500">
                            Gestion des demandes de support informatique
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <a
                            href="/demands"
                            className="hover:text-blue-600 transition"
                        >
                            Demandes
                        </a>

                        <a
                            href="/about"
                            className="hover:text-blue-600 transition"
                        >
                            À propos
                        </a>

                        <span>
                            © {new Date().getFullYear()} TechLine Care
                        </span>
                    </div>

                </div>
            </div>
        </footer>
    );
}