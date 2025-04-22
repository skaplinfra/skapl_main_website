'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const router = useRouter();
  const [isStaticExport, setIsStaticExport] = useState(false);

  useEffect(() => {
    setIsStaticExport(process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true');
  }, []);

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold mb-6">404</h1>
      <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
      </p>
      {isStaticExport ? (
        <a href="/" onClick={handleNavigation}>
          <Button>
            Return Home
          </Button>
        </a>
      ) : (
        <Link href="/">
          <Button>
            Return Home
          </Button>
        </Link>
      )}
    </div>
  );
} 