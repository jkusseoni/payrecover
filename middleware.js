import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

function resolveSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
    /\/rest\/v1\/?$/,
    ""
  ).replace(/\/$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return { supabaseUrl, supabaseAnonKey };
}

function getLocaleAndPath(pathname) {
  const match = pathname.match(/^\/(en|hi)(\/.*)?$/);
  if (!match) {
    return { locale: routing.defaultLocale, pathWithoutLocale: pathname };
  }
  return {
    locale: match[1],
    pathWithoutLocale: match[2] || "/",
  };
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  let response = intlMiddleware(request);
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const { locale, pathWithoutLocale } = getLocaleAndPath(pathname);
  const isProtectedRoute = pathWithoutLocale.startsWith("/dashboard");

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(en|hi)/:path*",
    "/((?!api|auth|_next|_vercel|.*\\..*).*)",
  ],
};
