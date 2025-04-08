"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { ClinicDeliveryConfirmation } from "@/components/dashboard/adimin/clinicDeliveryConfirmation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useRouter } from "next/navigation";

export default function ClinicDeliveryConfirmationsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Toaster position="top-center" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <PageHeader
            title="Confirmação de Entregas"
            description="Confirme a entrega de materiais por clínica"
          />
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>

        <ClinicDeliveryConfirmation />
      </main>
    </div>
  );
}
