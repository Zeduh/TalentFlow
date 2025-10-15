import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { useAuth } from "@/hooks/useAuth";

export type DashboardMetrics = {
  jobs: { open: number; closed: number; paused: number };
  candidates: Record<string, number>;
  interviews: { today: number; week: number };
};

export function useDashboardMetrics() {
  const { user } = useAuth();
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await api.get("/dashboard/metrics");
      return res.data;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}