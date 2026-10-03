import { db } from "@/lib/db";

export type PieceJointe = {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  id_uploader: string;
  uploader_name: string | null;
};

export async function findPiecesJointes(idDemand: string) {
  const r = await db.query(
    `SELECT a.id_attachment AS id, a.file_name, a.mime_type, a.size_bytes, a.created_at,
            a.id_uploader, u.first_name || ' ' || u.last_name AS uploader_name
     FROM attachments a
     LEFT JOIN users u ON u.id_user = a.id_uploader
     WHERE a.id_demand = $1 AND a.deleted_at IS NULL
     ORDER BY a.created_at`,
    [idDemand],
  );
  return r.rows as PieceJointe[];
}

export async function createPieceJointe(p: {
  idDemand: string;
  idUploader: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}) {
  const r = await db.query(
    `INSERT INTO attachments (id_demand, id_uploader, file_name, mime_type, size_bytes, storage_key)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_attachment AS id, file_name, mime_type, size_bytes, created_at, id_uploader`,
    [
      p.idDemand,
      p.idUploader,
      p.fileName,
      p.mimeType,
      p.sizeBytes,
      p.storageKey,
    ],
  );
  return r.rows[0] as Omit<PieceJointe, "uploader_name">;
}

// Pièce jointe + état de la demande (contrôle d'accès)
export async function findPieceJointe(id: string) {
  const r = await db.query(
    `SELECT a.id_attachment AS id, a.id_demand, a.id_uploader, a.file_name, a.mime_type,
            a.size_bytes, a.storage_key, a.deleted_at, d.deleted_at AS demande_supprimee
     FROM attachments a JOIN demands d ON d.id_demand = a.id_demand
     WHERE a.id_attachment = $1`,
    [id],
  );
  return (
    (r.rows[0] as
      | {
          id: string;
          id_demand: string;
          id_uploader: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          storage_key: string;
          deleted_at: string | null;
          demande_supprimee: string | null;
        }
      | undefined) ?? null
  );
}

// Suppression douce : le fichier reste sur le disque, la ligne est masquée
export async function softDeletePieceJointe(id: string) {
  await db.query(
    "UPDATE attachments SET deleted_at = now() WHERE id_attachment = $1",
    [id],
  );
}

export async function countPiecesJointes(idDemand: string) {
  const r = await db.query(
    "SELECT COUNT(*)::int AS n FROM attachments WHERE id_demand = $1 AND deleted_at IS NULL",
    [idDemand],
  );
  return r.rows[0].n as number;
}
