"use client";
import { Header } from "@/components/Header";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export default function FormLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex-1">
        <Header />
        {children}
      </div>
    </QueryClientProvider>
  );
}
