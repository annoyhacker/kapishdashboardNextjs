
import 'next';

declare module 'next' {
    type PageParams = Record<string, string | string[]>;
}