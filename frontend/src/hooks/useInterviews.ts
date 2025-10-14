import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export type Interview = {
  id: string;
  candidateId: string;
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled";
  calendarLink: string;
  organizationId: string;
  sequenceId: number;
};

type InterviewFilters = {
  status?: string;
  candidateId?: string;
  date?: string; // ISO string
  limit?: number;
};

export function useInterviews(filters: InterviewFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["interviews", filters],
    queryFn: async ({ pageParam }) => {
      const params = { ...filters, sequenceId: pageParam, limit: filters.limit ?? 10 };
      const res = await api.get("/interviews", { params });
      return res.data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}