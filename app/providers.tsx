'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

declare global {
  interface Window {
    fixTheme?: () => 'light' | 'dark';
  }
}

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

  // Add a class to the body to indicate that JS has loaded
  // Helps with avoiding any flash of wrong theme
  useEffect(() => {
    document.body.classList.add('js-loaded');
    
    // Add a class change listener to ensure theme consistency
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            mutation.target === document.documentElement) {
          // Store current theme when it changes in DOM
          const isDark = document.documentElement.classList.contains('dark');
          try {
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
          } catch (e) {
            console.error('Failed to save theme to localStorage:', e);
          }
          
          // Force theme-specific elements (like logos) to update
          window.dispatchEvent(new CustomEvent('theme-changed', { 
            detail: { theme: isDark ? 'dark' : 'light' } 
          }));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="theme"
      disableTransitionOnChange={false}
    >
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