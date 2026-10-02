import type { DemandStatus } from "@/lib/types/DemandStatus";

export interface Demand {
  id: string;
  title: string;
  description: string;
  status: DemandStatus;
  created_at: string;
}
