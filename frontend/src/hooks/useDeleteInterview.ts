import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, candidateId }: { id: string, candidateId?: string }) => {
      await api.delete(`/interviews/${id}`);
      return { id, candidateId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      
      // Invalidar o detalhe do candidato quando uma entrevista é excluída
      if (data.candidateId) {
        queryClient.invalidateQueries({ 
          queryKey: ["candidate-detail", data.candidateId] 
        });
      }
    },
  });
}