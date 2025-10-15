import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { useAuth } from "@/hooks/useAuth";

export type Tenant = {
  id: string;
  name: string;
};

export function useTenants() {
  const { user } = useAuth();
  return useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await api.get("/tenants");
      return res.data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}