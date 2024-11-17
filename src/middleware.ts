import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;

// Define public and protected routes
const AUTH_ROUTES = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
];

const PROTECTED_ROUTES = ["/account"];

// Define ignored routes
const IGNORED_ROUTES = [
  "/",
  "/api",
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
];

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const sessionId = req.cookies.get(SESSION_COOKIE_NAME);

  // Skip middleware for ignored routes, but if route is "/" check for exact match because all routes start with "/"
  if (
    IGNORED_ROUTES.some((route) => {
      if (route === "/") {
        return pathname === route;
      }
      return pathname.startsWith(route);
    })
  ) {
    return NextResponse.next();
  }

  // First check if it's an auth route - these take precedence
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  if (isAuthRoute) {
    // Redirect to account if trying to access auth pages while logged in
    if (sessionId) {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    return NextResponse.next();
  }

  // Then check for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !sessionId) {
    const loginUrl = new URL("/account/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
