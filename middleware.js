
// import { clerkMiddleware } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// // List of top-level paths that require authentication
// const protectedPaths = ["/dashboard", "/account", "/transaction"];

// export default clerkMiddleware(async (auth, req) => {
//   const { userId, redirectToSignIn } = await auth();

//   // Extract the pathname from the request URL
//   const { pathname } = new URL(req.url);

//   // Check if the requested path is protected
//   const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

//   if (!userId && isProtected) {
//     // Redirect to Clerk sign-in page if not logged in
//     return redirectToSignIn();
//   }

//   // Allow request to continue if logged in or route is not protected
//   return NextResponse.next();
// });

// export const config = {
//   // Apply middleware only to protected routes to reduce bundle size
//   matcher: ["/dashboard/:path*", "/account/:path*", "/transaction/:path*"],
// };
// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

// Protect only these top-level routes
export default clerkMiddleware({
  matcher: ["/dashboard/:path*", "/account/:path*", "/transaction/:path*"],
});
