import { authHeaders } from "./client";

export type StatsResponse = {
  leadsCount: number;
  avgLeadQuality: number;
  verifiedEmailPercent: number;
  decisionMakerPercent: number;
  activeWebsitePercent: number;
  chartData: { date: string; count: number }[];
};

export async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch("http://localhost:4000/api/stats", {
    headers: { ...authHeaders() },
  });
  const data = (await response.json()) as StatsResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Failed to load dashboard stats");
  }

  return data;
}

export async function fetchLeadsCount(): Promise<number> {
  const data = await fetchStats();
  return data.leadsCount;
}
