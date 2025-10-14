'use client';

import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LoginFields = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginFields>();

  const mutation = useLogin();

  const onSubmit = (data: LoginFields) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-800">E-mail</label>
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          autoComplete="email"
          placeholder="seu@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-800">Senha</label>
        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full rounded border px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={isSubmitting || mutation.isPending}
      >
        {isSubmitting || mutation.isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}