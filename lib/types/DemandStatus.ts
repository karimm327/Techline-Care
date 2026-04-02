export type DemandStatus = "NOUVELLE" | "EN_COURS" | "CLOTUREE";

export const STATUS_STYLES: Record<string, string> = {
    NOUVELLE: "bg-gray-100 text-gray-700",
    EN_COURS: "bg-blue-100 text-blue-700",
    CLOTUREE: "bg-teal-100 text-teal-700",
    ANNULEE: "bg-red-100 text-red-700",
};