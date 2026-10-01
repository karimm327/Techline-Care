"use client";

export default function LogoutButton() {
    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
        >
            Déconnexion
        </button>
    );
}