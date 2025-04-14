'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/10 rounded-lg mr-3"></div>
            <Link href="/" className="text-xl font-bold">
              SKAPL
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground/60 hover:text-foreground">
              Home
            </Link>
            <Link href="/services" className="text-foreground/60 hover:text-foreground">
              Services
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="text-foreground/60 hover:text-foreground">
              Contact
            </Link>
            <Link href="/careers" className="text-foreground/60 hover:text-foreground">
              Careers
            </Link>
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
          <div className="md:hidden">
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
            <Link
              href="/"
              className="block px-3 py-2 text-foreground/60 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/services"
              className="block px-3 py-2 text-foreground/60 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-foreground/60 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-foreground/60 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/careers"
              className="block px-3 py-2 text-foreground/60 hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Careers
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}