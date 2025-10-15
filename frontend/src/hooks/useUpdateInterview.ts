import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

type UpdateInterviewData = {
  id: string;
  scheduledAt: string;
  status: string;
  candidateId?: string;
};

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateInterviewData) => {
      const { id, candidateId, ...updateData } = data;
      const response = await api.put(`/interviews/${id}`, updateData);
      return { ...response.data, candidateId }; // Retornar com candidateId
    },
    onSuccess: (data, variables) => {
      // Invalidate all interviews queries to update UI
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      
      // Invalidate candidate detail if candidateId exists
      if (variables.candidateId) {
        queryClient.invalidateQueries({ 
          queryKey: ["candidate-detail", variables.candidateId] 
        });
      }
    },
  });
}