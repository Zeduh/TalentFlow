'use client';

import { Topbar } from "@/components/Topbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Topbar />
        <main className="flex-1 px-4 md:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}