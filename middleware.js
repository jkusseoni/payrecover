import { NextResponse } from 'next/server'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // 1. सुपबेस लॉगिन होने पर ब्राउज़र में 'sb-access-token' या 'sb-auth-token' नाम की कुकी सेट करता है
  // हम चेक करेंगे कि क्या इनमें से कोई भी कुकी मौजूद है
  const allCookies = req.cookies.getAll()
  const hasSupabaseSession = allCookies.some(cookie => cookie.name.startsWith('sb-'))

  // 2. जिन पेजों को बिना लॉगिन के लॉक रखना है
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/webhooks') || 
                           pathname.startsWith('/billing')

  // 3. अगर यूज़र लॉगिन नहीं है और प्रोटेक्टेड पेज खोलने की कोशिश करे -> /login पर भेजें
  if (!hasSupabaseSession && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 4. अगर यूज़र पहले से लॉगिन है और जबरदस्ती /login खोल रहा है -> /dashboard पर भेजें
  if (hasSupabaseSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

// यह मैच करना ज़रूरी है ताकि इन पेजों पर मिडलवेयर हमेशा एक्टिव रहे
export const config = {
  matcher: ['/dashboard/:path*', '/webhooks/:path*', '/billing/:path*', '/login'],
}