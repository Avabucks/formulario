import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/src/lib/session";

const protectedRoutes = ["/home", "/formulario", "/capitolo", "/editor"];
const adminRoutes = ["/admin"];

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  const isProtected = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isAdmin = adminRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  if ((isProtected || isAdmin) && !session.uid) {
    const loginUrl = new URL("/login", req.url);
    if (!isAdmin) {
      loginUrl.searchParams.set("next", req.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if ((req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/") && session.uid) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/home", "/formulario", "/capitolo", "/editor", "/formulario/:path*", "/capitolo/:path*", "/editor/:path*", "/login", "/admin"],
};