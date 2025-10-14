import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, jobId }: { id: string; jobId: string }) => {
      await api.delete(`/candidates/${id}`);
      return { id, jobId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["candidates", { jobId: variables.jobId }] });
    },
  });
}