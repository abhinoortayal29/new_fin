// import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/account(.*)",
//   "/transaction(.*)",
// ]);

// // Create Arcjet middleware
// const aj = arcjet({
//   key: process.env.ARCJET_KEY,
//   // characteristics: ["userId"], // Track based on Clerk userId
//   rules: [
//     // Shield protection for content and security
//     shield({
//       mode: "LIVE",
//     }),
//     detectBot({
//       mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
//       allow: [
//         "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
//         "GO_HTTP", // For Inngest
//         // See the full list at https://arcjet.com/bot-list
//       ],
//     }),
//   ],
// });

// // Create base Clerk middleware
// const clerk = clerkMiddleware(async (auth, req) => {
//   const { userId } = await auth();

// // redirect to sign in if user is not log in 
//   if (!userId && isProtectedRoute(req)) {
//     const { redirectToSignIn } = await auth();
//     return redirectToSignIn();
//   }

//   return NextResponse.next();
// });

// // Chain middlewares - ArcJet runs first, then Clerk
// export default createMiddleware(aj, clerk);

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };
// middleware.js (minimal, Clerk-only)
// middleware.js (Optimized for Vercel Edge, Clerk-only)
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// List of top-level paths that require authentication
const protectedPaths = ["/dashboard", "/account", "/transaction"];

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Extract the pathname from the request URL
  const { pathname } = new URL(req.url);

  // Check if the requested path is protected
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!userId && isProtected) {
    // Redirect to Clerk sign-in page if not logged in
    return redirectToSignIn();
  }

  // Allow request to continue if logged in or route is not protected
  return NextResponse.next();
});

export const config = {
  // Apply middleware only to protected routes to reduce bundle size
  matcher: ["/dashboard/:path*", "/account/:path*", "/transaction/:path*"],
};
