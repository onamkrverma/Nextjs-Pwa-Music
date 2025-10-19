import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimit } from "./utils/rateLimiter";
import { cookies } from "next/headers";

const { AUTH_SECRET } = process.env;

// Generate a secure fallback ID for anonymous users
function generateSecureId() {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => dec.toString(36)).join("-");
}

// Apply rate limiting and return response if exceeded
async function applyRateLimit(userIdentifier: string) {
  const { success } = await ratelimit.limit(userIdentifier);

  if (!success) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieStore = await cookies();

  // Determine auth cookie name based on environment
  const authCookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  // Get user token
  const token = await getToken({
    req,
    secret: AUTH_SECRET,
    cookieName: authCookieName,
  });

  // Paths requiring authentication
  const protectedPaths = [
    "/playlist/liked-songs",
    "/playlist/user-playlist",
    "/api/users",
  ];

  // Extract user ID from token
  const hexTokenSub = (token?.sub as any)?.buffer
    ? Buffer.from(Object.values((token?.sub as any).buffer)).toString("hex")
    : token?.sub;

  const userSpecificPaths = [
    `/api/users/${hexTokenSub}`,
    "/api/users/public-playlist",
    "/playlist/liked-songs",
    "/playlist/user-playlist",
    "/playlist",
  ];

  const publicPaths = [
    "/api/songs/search",
    "/api/songs",
    "/api/playlists",
    "/api/album",
    "/api/artists",
  ];

  // Handle unauthenticated access
  if (!token) {
    if (protectedPaths.some((path) => pathname.startsWith(path))) {
      if (pathname.startsWith("/api/users")) {
        return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    // Redirect authenticated users away from login/signup
    if (pathname === "/login" || pathname === "/signup") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Restrict access to user-specific paths

    const isUserPath = userSpecificPaths.some((path) =>
      pathname.startsWith(path)
    );
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (!isUserPath && !isPublicPath) {
      return NextResponse.json(
        { error: "You do not have access" },
        { status: 403 }
      );
    }
  }

  // Get or set anonymous user ID
  let userKey = cookieStore.get("anon_id")?.value;
  if (!userKey) {
    userKey = generateSecureId();
    cookieStore.set("anon_id", userKey, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  // Use email for authenticated users, fallback to anon ID
  const userIdentifier = token?.email || userKey;
  const exemptUsers = process.env.ADMIN_USER_EMAIL?.split(",");
  if (!exemptUsers?.includes(userIdentifier)) {
    const rateLimitResponse = await applyRateLimit(userIdentifier);
    if (rateLimitResponse) return rateLimitResponse;
  }

  return NextResponse.next();
}

// Apply middleware to relevant paths
export const config = {
  matcher: [
    "/playlist/:path*",
    "/api/songs/:path*",
    "/api/playlists/:path*",
    "/api/album/:path*",
    "/api/artists/:path*",
    "/api/users/:path*",
    "/login",
    "/signup",
  ],
};
