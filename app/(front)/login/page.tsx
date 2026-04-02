export default function LoginPage() {
    return (
        <div className="max-w-md mx-auto p-6">

            {/* entete */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Connexion
                </h1>
                <p className="text-gray-600 mt-2 text-sm">
                    Accédez à votre espace TechLine Care
                </p>
            </div>

            {/* le formulaire */}
            <div className="bg-white border rounded-lg p-6 shadow-sm">

                <form className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Identifiant
                        </label>
                        <input
                            type="text"
                            placeholder="username"
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Se connecter
                    </button>

                </form>

            </div>

            {/* pied de page */}
            <p className="text-xs text-gray-400 mt-4 text-center">
                Authentification en cours d’implémentation (JWT)
            </p>

        </div>
    );
}