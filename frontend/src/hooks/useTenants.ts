import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export type Tenant = {
  id: string;
  name: string;
};

export function useTenants() {
  return useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await api.get("/tenants");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}