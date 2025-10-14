import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.access_token, data.user);
      router.replace("/dashboard");
    },
  });
}