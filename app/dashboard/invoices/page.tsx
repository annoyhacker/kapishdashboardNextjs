import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page({
    // Next.js now passes searchParams as a Promise
    searchParams,
}: {
    searchParams: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    // await the resolved searchParams object
    const { query = '', page = '1' } = await searchParams;
    const currentPage = Number(page);

    try {
        const totalPages = await fetchInvoicesPages(query);

        if (currentPage < 1 || currentPage > totalPages) {
            return notFound();
        }

        return (
            <div className="w-full">
                <div className="flex w-full items-center justify-between">
                    <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    <Search placeholder="Search invoices..." />
                    <CreateInvoice />
                </div>

                <Suspense
                    key={`${query}-${currentPage}`}
                    fallback={<InvoicesTableSkeleton />}
                >
                    <Table query={query} currentPage={currentPage} />
                </Suspense>

                <div className="mt-5 flex w-full justify-center">
                    {totalPages > 0 && <Pagination totalPages={totalPages} />}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Failed to load invoices:', error);
        return notFound();
    }
}
