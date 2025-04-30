import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: any;
    };
}

export default async function Page({ params }: PageProps) {
    try {
        const [invoice, customers] = await Promise.all([
            fetchInvoiceById(params.id),
            fetchCustomers(),
        ]);

        if (!invoice) return notFound();

        return (
            <main>
                <Breadcrumbs
                    breadcrumbs={[
                        { label: 'Invoices', href: '/dashboard/invoices' },
                        {
                            label: 'Edit Invoice',
                            href: `/dashboard/invoices/${params.id}/edit`,
                            active: true,
                        },
                    ]}
                />
                <Form invoice={invoice} customers={customers} />
            </main>
        );
    } catch (error) {
        console.error('Edit page error:', error);
        return notFound();
    }
}
