"use client";

import {useState} from "react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function submit() {
        await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({email, password}),
        });
    }

    return (
        <form>
            <input value={email} placeholder="Email"/>
            <input value={password} type="password" placeholder="Mot de passe"/>
            <button onClick={submit}> Connexion</button>
        </form>
    );
}
