import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

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

  const intlResponse = intlMiddleware(request);

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const { locale, pathWithoutLocale } = getLocaleAndPath(pathname);
  const hasSupabaseSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  const isProtectedRoute =
    pathWithoutLocale.startsWith("/dashboard") ||
    pathWithoutLocale.startsWith("/billing");

  if (!hasSupabaseSession && isProtectedRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (hasSupabaseSession && pathWithoutLocale === "/login") {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/",
    "/(en|hi)/:path*",
    "/((?!api|auth|_next|_vercel|.*\\..*).*)",
  ],
};
