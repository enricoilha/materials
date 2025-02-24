// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Don't redirect if we're already on /auth/login
  if (!session && isProtectedRoute && req.nextUrl.pathname !== "/auth/login") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirect to dashboard if we're on login page and already authenticated
  if (session && req.nextUrl.pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
