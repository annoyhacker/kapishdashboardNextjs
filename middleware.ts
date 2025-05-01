// middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({
    // ONLY middleware options go here:
    callbacks: {
        authorized({ token }) {
            // return `true` to allow, `false` to block
            return !!token; // only allow if there's a valid session token
        },
    },
});

export const config = {
    runtime: "nodejs",    // so dynamic eval is OK
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
