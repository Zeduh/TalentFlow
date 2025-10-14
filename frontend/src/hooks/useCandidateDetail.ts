import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Interview } from "./useInterviews"; // Importa o tipo Interview

export type Candidate = {
  id: string;
  name: string;
  email: string;
  status: string;
  jobId: string;
  organizationId: string;
  interviews?: Interview[];
};

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