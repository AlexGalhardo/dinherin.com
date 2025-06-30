import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
	function middleware(req) {
		const protectedPaths = ["/dashboard", "/dashboard", "/profile"];
		const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

		if (!req.nextauth.token && isProtectedPath) {
			const loginUrl = new URL("/login", req.url);
			loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
			return NextResponse.redirect(loginUrl);
		}

		if (req.nextauth.token && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
			return NextResponse.redirect(new URL("/dashboard", req.url));
		}

		return NextResponse.next();
	},
	{
		callbacks: {
			authorized: () => true,
		},
	},
);

export const config = {
	matcher: ["/dashboard/:path*", "/dashboard/:path*", "/profile/:path*", "/login", "/signup"],
};
