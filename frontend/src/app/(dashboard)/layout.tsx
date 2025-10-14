'use client';

import React from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <section>
        {children}
      </section>
    </ProtectedRoute>
  );
}