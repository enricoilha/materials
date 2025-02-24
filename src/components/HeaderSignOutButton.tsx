"use server";

import { createClientServer } from "@/lib/server";

export async function HeaderSignOutButton() {
  const supabase = await createClientServer();
  await supabase.auth.signOut();
}
