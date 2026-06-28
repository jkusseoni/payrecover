import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = routing.locales.includes(localeCookie)
    ? localeCookie
    : routing.defaultLocale;
  const next = searchParams.get("next") ?? `/${locale}/dashboard`;

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
    /\/rest\/v1\/?$/,
    ""
  ).replace(/\/$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = NextResponse.redirect(`${origin}${next}`);

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return NextResponse.redirect(
      `${origin}/${locale}/login?error=auth_callback_failed`
    );
  }

  return response;
}
