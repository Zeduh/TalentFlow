import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-infinite"] });
    },
  });
}