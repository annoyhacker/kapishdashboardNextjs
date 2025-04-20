'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';

// Type Definitions
export type InvoiceState = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export type UserState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
};

// Schemas
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const SignupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// Invoice Actions
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(
    prevState: InvoiceState,
    formData: FormData
): Promise<InvoiceState> {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Create Invoice.',
            errors: {}
        };
    }
    // The redirect() call will throw an exception to exit the function
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
    id: string,
    prevState: InvoiceState,
    formData: FormData
): Promise<InvoiceState> {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Update Invoice.',
            errors: {}
        };
    }
}

export async function deleteInvoice(id: string): Promise<void> {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete invoice');
    }
}

// Auth Actions
export async function authenticate(
    prevState: UserState | undefined,
    formData: FormData,
): Promise<UserState> {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirect: false,
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        success: false,
                        message: 'Invalid credentials.',
                        errors: {}
                    };
                default:
                    return {
                        success: false,
                        message: 'Something went wrong.',
                        errors: {}
                    };
            }
        }
        return {
            success: false,
            message: 'An unexpected error occurred.',
            errors: {}
        };
    }
}

// User Actions
export async function createUser(
    prevState: UserState,
    formData: FormData
): Promise<UserState> {
    const validatedFields = SignupSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed'
        };
    }

    const { name, email, password } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await sql`
            SELECT email FROM users WHERE email = ${email}
        `;

        if (existingUser.rows.length > 0) {
            return {
                success: false,
                errors: { email: ['Email address already exists.'] },
                message: 'Email already registered'
            };
        }

        await sql`
            INSERT INTO users (name, email, password)
            VALUES (${name}, ${email}, ${hashedPassword})
        `;

        return {
            success: true,
            message: 'Account created successfully! Redirecting to login...'
        };
    } catch (error) {
        console.error('Database Error:', error);
        return {
            success: false,
            message: 'Database error: Failed to create account.',
            errors: {}
        };
    }
}