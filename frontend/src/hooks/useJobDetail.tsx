import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Job } from "./useJobs";
import { useAuth } from "@/hooks/useAuth";

export function useJobDetail(id?: string) {
  const { user } = useAuth();
  return useQuery<Job>({
    queryKey: ["job-detail", id],
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`);
      return res.data;
    },
    enabled: !!user && !!id,
  });
}