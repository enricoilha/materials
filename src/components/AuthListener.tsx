// app/auth-listener.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthListener() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/auth/login";
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
