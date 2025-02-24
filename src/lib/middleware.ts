import { createClientServer } from "./server";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    const supabase = await createClientServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    console.log("Auth check for path:", request.nextUrl.pathname);
    console.log("User status:", user ? "authenticated" : "not authenticated");

    const isAuthPath = request.nextUrl.pathname.startsWith("/auth/");
    const isRootPath = request.nextUrl.pathname === "/";

    // If there's an error or no user, and trying to access protected routes
    if ((!user || error) && (isRootPath || !isAuthPath)) {
      console.log("Redirecting unauthenticated user to login");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // If user is authenticated and trying to access auth pages
    if (user && isAuthPath) {
      console.log("Redirecting authenticated user to home");
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}
