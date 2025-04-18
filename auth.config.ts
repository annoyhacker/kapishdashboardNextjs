import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/signup',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            const isPublicPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup';

            if (isPublicPage) {
                if (isLoggedIn && isOnDashboard) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }

            if (isOnDashboard) {
                return isLoggedIn; // Redirect unauthenticated users to login page
            }

            return false; // Default deny
        },
    },
    providers: [],

} satisfies NextAuthConfig;

