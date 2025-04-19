import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-6">404</h1>
      <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>
          Return Home
        </Button>
      </Link>
    </div>
  );
} 