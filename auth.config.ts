import NextAuth, { NextAuthOptions } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';
import { NextRequest } from 'next/server';

// Define a custom User type if needed
interface User {
    id: string;
    email: string;
    name?: string;
}

export const authConfig: NextAuthOptions = {
    pages: {
        signIn: '/login', // Custom login page
        error: '/login', // Custom error page
    },
    callbacks: {
        // Use the 'signIn' callback to check if a user can sign in
        async signIn({ user, account, profile }) {
            const isLoggedIn = !!user;
            if (isLoggedIn && account?.provider === 'credentials') {
                return true; // Allow sign-in if valid credentials
            }
            return false; // Reject if not valid
        },
        // Optional session callback to customize session data
        async session({ session, user }) {
            session.user = user;
            return session;
        }
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Assuming you fetch this from your DB
                const user = {
                    id: '123', // Example ID, replace with actual DB value
                    email: credentials?.email ?? '',
                    password: credentials?.password ?? '',
                    name: 'User Name' // Optional, depending on your DB schema
                };

                if (user.email && user.password) {
                    return user; // Return the complete user object
                } else {
                    return null; // Return null if no valid user found
                }
            }
        }),
    ]
};

export default NextAuth(authConfig);
