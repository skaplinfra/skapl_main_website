import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: 'light' | 'dark';
          appearance?: 'always' | 'execute' | 'interaction-only';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ siteKey, onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>();
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const interval = setInterval(() => {
      if (window.turnstile) {
        try {
          // Remove existing widget if any
          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
          }

          // Render new widget
          widgetIdRef.current = window.turnstile.render(container, {
            sitekey: siteKey,
            callback: onVerify,
            theme: isDark ? 'dark' : 'light',
          });
        } catch (error) {
          console.error('Turnstile render error:', error);
        }
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Turnstile cleanup error:', error);
        }
      }
    };
  }, [siteKey, onVerify, isDark]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />
      <div ref={containerRef} />
    </>
  );
} 