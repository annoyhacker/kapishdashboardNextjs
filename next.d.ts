import 'next';

declare module 'next' {
    export type PageProps<T extends Record<string, unknown> = {}> = T & {
        params?: Record<string, string | string[]>
        searchParams?: { [key: string]: string | string[] | undefined }
    }
}