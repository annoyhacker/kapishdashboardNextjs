import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');

            // Simplified return statement
            return isOnDashboard ? isLoggedIn : true;
        },
    },
    // Add providers array to satisfy type requirements
    providers: []
};