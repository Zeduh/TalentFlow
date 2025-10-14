import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Job } from "./useJobs";

export function useJobDetail(id?: string) {
  return useQuery<Job>({
    queryKey: ["job-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`);
      return res.data;
    },
  });
}