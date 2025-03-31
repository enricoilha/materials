import { createClientServer } from "@/lib/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClientServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return NextResponse.json({ session });
}
