'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const [isStaticExport, setIsStaticExport] = useState(false);

  useEffect(() => {
    setIsStaticExport(process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true');
  }, []);

  const handleNavigation = (href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMenuOpen(false);
    router.push(href);
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    if (isStaticExport) {
      return (
        <a 
          href={href} 
          className="text-foreground/60 hover:text-foreground text-lg"
          onClick={(e) => handleNavigation(href, e)}
        >
          {children}
        </a>
      );
    }
    
    return (
      <Link href={href} className="text-foreground/60 hover:text-foreground text-lg">
        {children}
      </Link>
    );
  };

  return (
    <nav className="fixed w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <NavLink href="/">
            <div className="flex items-center">
              <div className="relative w-32 h-32 -my-4">
                <Image
                  src="/logo.png"
                  alt="SKAPL Logo"
                  fill
                  className="object-contain p-1"
                  priority
                  sizes="(max-width: 768px) 80px, 128px"
                  quality={100}
                />
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/careers">Careers</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="mr-2"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isStaticExport ? (
              <>
                <a href="/" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={(e) => handleNavigation('/', e)}>Home</a>
                <a href="/services" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={(e) => handleNavigation('/services', e)}>Services</a>
                <a href="/about" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={(e) => handleNavigation('/about', e)}>About</a>
                <a href="/contact" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={(e) => handleNavigation('/contact', e)}>Contact</a>
                <a href="/careers" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={(e) => handleNavigation('/careers', e)}>Careers</a>
                <a href="/blog" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={(e) => handleNavigation('/blog', e)}>Blog</a>
              </>
            ) : (
              <>
                <Link href="/" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link href="/services" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Services</Link>
                <Link href="/about" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link href="/contact" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                <Link href="/careers" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Careers</Link>
                <Link href="/blog" className="block px-3 py-2 text-foreground/60 hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Blog</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}