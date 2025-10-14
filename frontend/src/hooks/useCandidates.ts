import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export type Candidate = {
  id: string;
  name: string;
  email: string;
  status: "applied" | "screening" | "interview_scheduled" | "offer" | "hired" | "rejected";
  jobId: string;
  organizationId: string;
};

export type CandidatesResponse = {
  data: Candidate[];
  nextCursor?: number;
  hasMore: boolean;
};

type Params = {
  jobId: string;
  status?: string;
  sequenceId?: number;
  limit?: number;
};

export function useCandidates(params: Params) {
  // Remove status se for vazio ou undefined
  const queryParams = { ...params };
  if (!queryParams.status) {
    delete queryParams.status;
  }
  if (!queryParams.sequenceId) {
    delete queryParams.sequenceId;
  }

  return useQuery<CandidatesResponse>({
    queryKey: ["candidates", queryParams],
    queryFn: async () => {
      const res = await api.get("/candidates", { params: queryParams });
      return res.data;
    },
    enabled: !!params.jobId,
  });
}