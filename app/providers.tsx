'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle SPA-style navigation in static exports
  useEffect(() => {
    // Check if we're running in a static export
    if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
      // Add click handler to all internal links
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && 
            link.href && 
            link.href.startsWith(window.location.origin) && 
            !link.target && 
            !link.download && 
            !(link.getAttribute('rel') === 'external')) {
          e.preventDefault();
          const href = link.getAttribute('href') || '/';
          router.push(href);
        }
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the standard tablet breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Toaster 
        position={isMobile ? "top-center" : "bottom-right"} 
        expand={true} 
        richColors
        closeButton
      />
      {children}
    </ThemeProvider>
  );
}