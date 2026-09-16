import { DocumentTitle } from '@/components/document-title';
import { Link } from 'react-router';

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FDFDFC] px-6 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <DocumentTitle title="Not found" />
            <h1 className="text-2xl font-medium">Page not found</h1>
            <p className="text-[#706f6c] dark:text-[#A1A09A]">
                The page you are looking for does not exist.
            </p>
            <Link to="/" className="underline underline-offset-4">
                Go home
            </Link>
        </div>
    );
}
