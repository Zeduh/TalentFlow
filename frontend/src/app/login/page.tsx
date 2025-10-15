'use client';

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoginForm } from "../../components/LoginForm";

export default function LoginPage() {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.clear();
  }, [queryClient]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-2xl border border-gray-200">
        <h1 className="mb-8 text-3xl font-extrabold text-center text-blue-800 tracking-tight">
          TalentFlow
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}