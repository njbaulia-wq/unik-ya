import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: (1) suntik/propagasi x-request-id; (2) refresh session Supabase;
 * (3) anon ke /dashboard* dan /admin* diarahkan ke /login. Cek peran admin
 * dilakukan server-side di layout (butuh query DB, bukan di edge).
 */
export async function middleware(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id") ??
    (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

  const response = NextResponse.next({ request });
  response.headers.set("x-request-id", requestId);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response; // env belum diisi (mis. build) → lewati guard session

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!data.user && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    const redirect = NextResponse.redirect(login);
    redirect.headers.set("x-request-id", requestId);
    return redirect;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
