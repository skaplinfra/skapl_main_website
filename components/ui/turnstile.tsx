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
  const [retryCount, setRetryCount] = useState(0);

  // Function to render the widget
  const renderWidget = () => {
    if (window.turnstile && ref.current) {
      try {
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
      } catch (error) {
        console.error("Error rendering Turnstile widget:", error);
        // If we've had less than 5 retries, try again after a delay
        if (retryCount < 5) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        } else {
          // After 5 retries, generate a fallback token
          console.log(`Using fallback token after failed retries for ${instanceId}`);
          onVerify(`STATIC_EXPORT_TOKEN_${Date.now()}_${instanceId}`);
        }
      }
    }
  };

  // Only load the script once
  useEffect(() => {
    // Skip if the script is already loaded
    if (document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      setScriptLoaded(true);
      return;
    }

    // For static export, if script loading takes too long, provide a fallback
    const timeoutId = setTimeout(() => {
      if (!scriptLoaded && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
        console.log(`Script loading timeout for ${instanceId}, using fallback`);
        onVerify(`STATIC_EXPORT_TOKEN_${Date.now()}_${instanceId}`);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [instanceId, onVerify, scriptLoaded]);

  // Render widget when the script is loaded
  useEffect(() => {
    if (!ref.current || widgetRendered) return;
    
    // If already rendered, clean up first
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    
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
      
      // Timeout after 5 seconds for static exports
      const timeoutId = setTimeout(() => {
        if (!window.turnstile && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
          clearInterval(intervalId);
          console.log(`Turnstile not loaded after timeout for ${instanceId}, using fallback`);
          onVerify(`STATIC_EXPORT_TOKEN_${Date.now()}_${instanceId}`);
        }
      }, 5000);
      
      // Cleanup
      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [siteKey, onVerify, instanceId, widgetRendered, retryCount]);

  // If site key is missing or empty in production, use fallback immediately
  useEffect(() => {
    if (!siteKey && process.env.NODE_ENV === 'production') {
      console.warn(`Missing Turnstile site key for ${instanceId}, using fallback token`);
      onVerify(`MISSING_KEY_TOKEN_${Date.now()}_${instanceId}`);
    }
  }, [siteKey, instanceId, onVerify]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (error) {
          console.error("Error cleaning up Turnstile widget:", error);
        }
      }
    };
  }, []);

  return (
    <div className="turnstile-container" data-instance-id={instanceId}>
      <div ref={ref} id={instanceId} className="cf-turnstile" data-sitekey={siteKey}></div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />
    </div>
  );
} 