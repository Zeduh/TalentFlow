import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Candidate } from "./useCandidates";

type CreateCandidateInput = {
  name: string;
  email: string;
  status: string;
  jobId: string;
};

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCandidateInput) => {
      const res = await api.post<Candidate>("/candidates", data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates", { jobId: variables.jobId }] });
    },
  });
}