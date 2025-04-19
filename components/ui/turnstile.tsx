'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// Define window.turnstile for TypeScript
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  id?: string; // Optional id to prevent duplicates
}

// Keep track of rendered instances to prevent duplicates
let instanceCount = 0;

export function Turnstile({ siteKey, onVerify, id }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [instanceId] = useState(() => id || `turnstile-widget-${instanceCount++}`);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [widgetRendered, setWidgetRendered] = useState(false);

  // Only load the script once
  useEffect(() => {
    // Skip if the script is already loaded
    if (document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      setScriptLoaded(true);
      return;
    }
  }, []);

  // Render widget when the script is loaded
  useEffect(() => {
    if (!ref.current || widgetRendered) return;
    
    // If already rendered, clean up first
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    
    // Function to render the widget
    const renderWidget = () => {
      if (window.turnstile && ref.current) {
        console.log(`Rendering Turnstile widget with ID: ${instanceId}`);
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            console.log(`Turnstile verified for ${instanceId}`);
            onVerify(token);
          },
          'refresh-expired': 'auto',
        });
        setWidgetRendered(true);
      }
    };

    // Check if turnstile is loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      // Check if turnstile is loaded every 100ms
      const intervalId = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(intervalId);
        }
      }, 100);
      
      // Cleanup
      return () => clearInterval(intervalId);
    }
  }, [siteKey, onVerify, instanceId, widgetRendered]);

  // For static exports, generate a fake token
  useEffect(() => {
    // In static export, generate a token after 3 seconds
    const timeoutId = setTimeout(() => {
      if (!window.turnstile && process.env.NODE_ENV === 'production') {
        console.log(`Using fallback token for ${instanceId}`);
        onVerify(`STATIC_EXPORT_TOKEN_${Date.now()}_${instanceId}`);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [onVerify, instanceId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    };
  }, []);

  return (
    <div className="turnstile-container" data-instance-id={instanceId}>
      <div ref={ref} id={instanceId} className="cf-turnstile" data-sitekey={siteKey}></div>
      {!scriptLoaded && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          onLoad={() => setScriptLoaded(true)}
          async
          defer
        />
      )}
    </div>
  );
} 