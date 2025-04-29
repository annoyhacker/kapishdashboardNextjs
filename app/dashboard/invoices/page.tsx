import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { notFound } from 'next/navigation';

// Force dynamic rendering for searchParams
export const dynamic = 'force-dynamic';

export default async function Page({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Safe parameter extraction with type safety
    const query = typeof searchParams.query === 'string' ? searchParams.query : '';
    const pageParam = typeof searchParams.page === 'string' ? searchParams.page : '1';

    // Validate and parse page number
    const parsedPage = parseInt(pageParam, 10);
    const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    let totalPages = 1;
    try {
        totalPages = await fetchInvoicesPages(query);

        // Handle invalid page numbers
        if (currentPage > totalPages) {
            return notFound();
        }
    } catch (error) {
        console.error('Failed to load invoices:', error);
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
}