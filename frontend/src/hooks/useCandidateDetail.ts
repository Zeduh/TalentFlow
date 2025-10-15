import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Interview } from "./useInterviews";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  return useQuery<Candidate>({
    queryKey: ["candidate-detail", id],
    queryFn: async () => {
      const res = await api.get(`/candidates/${id}`);
      return res.data;
    },
    enabled: !!user && !!id,
  });
}