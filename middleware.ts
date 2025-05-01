// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        // only allow if there’s a valid session token
        authorized({ token }) {
            return !!token;
        },
    },
});

// Scope the middleware to your dashboard routes
export const config = {
    matcher: ["/dashboard/:path*"],
    // If you ever need dynamic-code-support, you can add:
    // runtime: "nodejs",
};
