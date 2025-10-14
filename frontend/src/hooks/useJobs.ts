import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export type Job = {
  id: string;
  title: string;
  status: "open" | "closed" | "paused";
  organizationId: string;
  createdAt: string;
};

export type JobsResponse = {
  data: Job[];
  nextCursor?: string;
  hasMore: boolean;
};

type Params = {
  status?: string;
  limit?: number;
  organizationId?: string;
};

export function useJobsInfinite(params: Params) {
  const queryParams = { ...params };
  if (!queryParams.status) {
    delete queryParams.status;
  }
  if (!queryParams.organizationId) {
    delete queryParams.organizationId;
  }

  return useInfiniteQuery<JobsResponse>({
    queryKey: ["jobs-infinite", queryParams],
    queryFn: async ({ pageParam }) => {
      const requestParams = {
        ...queryParams,
        ...(pageParam ? { cursor: pageParam } : {})
      };
      const res = await api.get("/jobs", { params: requestParams });
      return res.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialPageParam: undefined,
  });
}