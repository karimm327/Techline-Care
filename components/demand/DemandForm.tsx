"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
    id_category: string;
    label: string;
};

type Priority = {
    id_priority: string;
    label: string;
};

type Agent = {
    id_user: string;
    first_name: string;
    last_name: string;
};

type Status = {
    id_status: string;
    label: string;
};

type Demand = {
    title: string;
    description: string;
    id_category: string;
    id_priority: string;
    id_status: string;
    id_assigned_agent: string | null;
};

type Props = {
    submitUrl: string;
    method: "POST" | "PUT";
    redirectTo: string;
    initialData?: Demand;
};

export default function DemandForm({ submitUrl, method, redirectTo, initialData }: Props) {
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);

    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [categoryId, setCategoryId] = useState(initialData?.id_category || "");
    const [priorityId, setPriorityId] = useState(initialData?.id_priority || "");
    const [agentId, setAgentId] = useState(initialData?.id_assigned_agent || "");

    const [statuses, setStatuses] = useState<Status[]>([]);
    const [statusId, setStatusId] = useState(initialData?.id_status || "");

    const [error, setError] = useState("");

    // Recupere dynamiquement les données
    useEffect(() => {
        async function loadData() {
            try {
                const [catRes, prioRes, agentRes, statusRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/priorities"),
                    fetch("/api/users?role=agent"),
                    fetch("/api/statuses"),
                ]);

                const [catData, prioData, agentData, statusData] = await Promise.all([
                    catRes.json(),
                    prioRes.json(),
                    agentRes.json(),
                    statusRes.json(),
                ]);

                setCategories(catData);
                setPriorities(prioData);
                setAgents(agentData);
                setStatuses(statusData);
            } catch (err) {
                setError("Erreur lors du chargement des données.");
            }
        }

        loadData();
    }, []);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setCategoryId(initialData.id_category);
            setPriorityId(initialData.id_priority);
            setAgentId(initialData.id_assigned_agent || "");
            setStatusId(initialData.id_status || "");
        }
    }, [initialData]);

    // envoi du formulaire
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(submitUrl, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    idCategory: categoryId,
                    idPriority: priorityId,
                    idAssignedAgent: agentId || null,
                    ...(method === "PUT" && { idStatus: statusId }),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if(data.message?.name && data.message.name == "ZodError") {
                    const message = JSON.parse(data.message.message)
                        .map((zodMessage: any) => zodMessage.message)
                        .join("\n");

                    throw new Error(message);
                }
                throw new Error("Erreur lors de la création");
            }

            router.push(redirectTo);
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>

            {error && (
                <p style={{ color: "red", marginBottom: "10px" }}>
                    {error}
                </p>
            )}

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Titre
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Catégorie
                </label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                >
                    <option value="">-- Choisir une catégorie --</option>
                    {categories.map((c) => (
                        <option key={c.id_category} value={c.id_category}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Priorité
                </label>
                <select
                    value={priorityId}
                    onChange={(e) => setPriorityId(e.target.value)}
                    required
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                >
                    <option value="">-- Choisir une priorité --</option>
                    {priorities.map((p) => (
                        <option key={p.id_priority} value={p.id_priority}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    Agent assigné (optionnel)
                </label>
                <select
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                >
                    <option value="">-- Aucun agent --</option>
                    {agents.map((a) => (
                        <option key={a.id_user} value={a.id_user}>
                            {a.first_name} {a.last_name}
                        </option>
                    ))}
                </select>
            </div>

            {method === "PUT" && (
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                        Statut
                    </label>
                    <select
                        value={statusId}
                        onChange={(e) => setStatusId(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px"
                        }}
                    >
                        <option value="">-- Choisir un statut --</option>
                        {statuses.map((s) => (
                            <option key={s.id_status} value={s.id_status}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button
                type="submit"
                style={{
                    padding: "10px 15px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                {method === "POST" ? "Créer la demande" : "Mettre à jour la demande"}
            </button>

        </form>
    );
}