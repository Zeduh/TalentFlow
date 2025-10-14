import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Job } from "./useJobs";

type UpdateJobInput = {
  id: string;
  title: string;
  status: "open" | "closed" | "paused";
  organizationId?: string;
};

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateJobInput) => {
      // Remova o id do corpo da requisição
      const { id, ...body } = data;
      const res = await api.put<Job>(`/jobs/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs-infinite"] });
    },
  });
}