import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = nextUrl.pathname.startsWith("/admin");

  if (isAdmin) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
    const role = (req.auth?.user as any)?.role;
    if (role !== "ADMIN") {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
