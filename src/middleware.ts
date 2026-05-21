import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/destinations",
  "/budget-planner",
  "/trip-categories",
  "/hidden-places",
  "/one-day-trips",
  "/explore-bangalore",
  "/multi-stop",
  "/multi-stop/live",
  "/profile",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth;
  const isProtected = PROTECTED.some((p) => nextUrl.pathname.startsWith(p));

  if (isProtected && !isAuthed) {
    const url = new URL("/", nextUrl);
    url.searchParams.set("from", nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets and the auth API itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)"],
};
