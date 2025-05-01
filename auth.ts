import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod'; // Assuming you're using zod for validation

interface User {
    id: string;
    email: string;
    name?: string;
}

export const authConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(6),
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    return null; // Invalid credentials
                }

                // Here you would typically check against a database
                const user = {
                    id: '123', // Example user ID, replace with actual DB value
                    email: credentials.email,
                    password: credentials.password, // Never store raw passwords, use hashing in production!
                    name: 'User Name', // Optional
                };

                return user || null; // Return the user if found, otherwise null
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/login',
    },
};

export default NextAuth(authConfig);
