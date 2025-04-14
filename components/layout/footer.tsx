import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SKAPL</h3>
            <p className="text-muted-foreground">
              Building sustainable futures through innovative energy solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>contact@skapl.com</li>
              <li>+91 123 456 7890</li>
              <li>123 Business Park,<br />Gujarat, India</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SKAPL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}