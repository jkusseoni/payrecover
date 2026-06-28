import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // एक्टिव सेशन चेक करें
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl;

  // अगर यूजर लॉगिन नहीं है और अंदर के पेजों पर जाने की कोशिश कर रहे हैं
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/webhooks') || pathname.startsWith('/billing'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // अगर यूजर पहले से लॉगिन है और जबरदस्ती दोबारा /login पेज खोल रहा है
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

// यह मैच करना ज़रूरी है ताकि इन पेजों पर मिडलवेयर हमेशा ट्रिगर हो
export const config = {
  matcher: ['/dashboard/:path*', '/webhooks/:path*', '/billing/:path*', '/login'],
}