import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SKAPL - Building Sustainable Futures',
  description: 'SKAPL is a leading energy consulting and project management firm specializing in sustainable solutions.',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon-16x16.png',
        type: 'image/png',
        sizes: '16x16',
      },
      {
        url: '/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32',
      }
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5'
      }
    ]
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SKAPL'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to restore theme immediately and prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme') || 'light';
                  document.documentElement.classList.add(storedTheme);
                  
                  // Add global helper for theme debugging
                  window.fixTheme = function() {
                    var currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
                    console.log('Current theme:', currentTheme);
                    localStorage.setItem('theme', currentTheme);
                    
                    if (currentTheme === 'dark') {
                      document.documentElement.classList.remove('light');
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.classList.add('light');
                    }
                    
                    // Dispatch event for components to update
                    if (window.dispatchEvent && typeof CustomEvent === 'function') {
                      window.dispatchEvent(new CustomEvent('theme-changed', { 
                        detail: { theme: currentTheme } 
                      }));
                    }
                    
                    console.log('Theme fixed:', currentTheme);
                    return currentTheme;
                  };
                  
                  // Monitor theme changes
                  var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.attributeName === 'class') {
                        try {
                          var isDark = document.documentElement.classList.contains('dark');
                          localStorage.setItem('theme', isDark ? 'dark' : 'light');
                        } catch (e) {
                          console.error('Failed to sync theme with localStorage:', e);
                        }
                      }
                    });
                  });
                  
                  observer.observe(document.documentElement, { attributes: true });
                } catch (e) {
                  console.error('Failed to restore theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}