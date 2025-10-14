import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Job } from "./useJobs";

type CreateJobInput = {
  title: string;
  status: "open" | "closed" | "paused";
  organizationId?: string;
};

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobInput) => {
      const res = await api.post<Job>("/jobs", data);
      return res.data;
    },
    onSuccess: () => {
      // Invalida queries para atualizar a lista de vagas
      queryClient.invalidateQueries({ queryKey: ["jobs-infinite"] });
    },
  });
}