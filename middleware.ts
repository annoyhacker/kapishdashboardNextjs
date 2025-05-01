// middleware.ts

import { withAuth } from "next-auth/middleware";
import { authConfig } from "./auth.config";

export default withAuth(authConfig);

// Force Node.js runtime (allows dynamic code in NextAuth)
export const config = {
    runtime: "nodejs",
    // match everything except api, next internals, images, etc.
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
