import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // ✅ Add all public routes here
  const publicRoutes = [
    '/', 
    '/login', 
    '/register', 
    '/forgot-password',
    '/reset-password',
    '/about',           // ✅ Add about page
    '/contact',         // ✅ Add contact page
    //'/products',        // ✅ Add products page
    //'/pricing',         // ✅ Add pricing page
    //'/faq',             // ✅ Add FAQ page
    //'/blog',            // ✅ Add blog page
    //'/terms',           // ✅ Add terms page
    //'/privacy',         // ✅ Add privacy page
    //'/refund',          // ✅ Add refund policy
    //'/help',            // ✅ Add help center
    //'/testimonials',    // ✅ Add testimonials
    //'/affiliate',       // ✅ Add affiliate program
    //'/plan',            // ✅ Add compensation plan
  ];
  
  // Check if the path starts with any public route or is exactly a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname === '/'
  );

  // If no user and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user exists and trying to access public routes (except reset-password)
  if (user && isPublicRoute) {
    // Don't redirect from reset-password if there's a session
    if (request.nextUrl.pathname === '/reset-password') {
      return response;
    }

    // Fetch user role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log('🔍 User role detected:', profile?.role);

    // Redirect based on role
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      console.log('⛔ Non-admin trying to access admin route');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};