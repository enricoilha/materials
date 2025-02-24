import { createClientServer } from "@/lib/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AuthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = (await headersList.get("x-invoke-path")) || "";

  // Don't check auth for auth routes
  if (pathname.startsWith("/auth/")) {
    return <>{children}</>;
  }

  const supabase = await createClientServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
