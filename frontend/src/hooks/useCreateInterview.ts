import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Interview } from "./useInterviews";

type CreateInterviewInput = {
  candidateId: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  organizationId?: string;
};

export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInterviewInput) => {
      const res = await api.post<Interview>("/interviews", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
}