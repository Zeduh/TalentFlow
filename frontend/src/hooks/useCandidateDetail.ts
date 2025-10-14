import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Candidate } from "./useCandidates";

export function useCandidateDetail(id?: string) {
  return useQuery<Candidate>({
    queryKey: ["candidate-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/candidates/${id}`);
      return res.data;
    },
  });
}