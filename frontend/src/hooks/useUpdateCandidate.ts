import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Candidate } from "./useCandidates";

type UpdateCandidateInput = {
  id: string;
  name?: string;
  email?: string;
  status?: string;
  jobId?: string;
};

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateCandidateInput) => {
      const { id, ...body } = data;
      const res = await api.put<Candidate>(`/candidates/${id}`, body);
      return res.data;
    },
    onSuccess: (updated, variables) => {
      // Invalida a lista de candidatos da vaga correspondente
      queryClient.invalidateQueries({ queryKey: ["candidates", { jobId: updated.jobId }] });
      // Invalida o detalhe do candidato
      queryClient.invalidateQueries({ queryKey: ["candidate-detail", variables.id] });
    },
  });
}