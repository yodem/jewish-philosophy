import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogNotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Blog Post Not Found</h1>
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
        Sorry, we couldn&apos;t find the blog post you&apos;re looking for.
      </p>
      <Link href="/blog">
        <Button className="cursor-pointer">Return to Blog</Button>
      </Link>
    </div>
  );
} 