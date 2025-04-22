'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTheme } from 'next-themes';

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  date: string;
  author: string;
  authorRole: string;
  category: string;
};

export default function ClientBlogPost({ post }: { post: BlogPost }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Mark as mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom theme change events
  useEffect(() => {
    const handleThemeChanged = (e: Event) => {
      // Force a re-render when theme changes
      setTimeout(() => {
        setMounted(prev => {
          const newState = !prev;
          setMounted(true);
          return true;
        });
      }, 10);
    };
    
    window.addEventListener('theme-changed', handleThemeChanged);
    return () => {
      window.removeEventListener('theme-changed', handleThemeChanged);
    };
  }, []);

  // SSR safety - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Loading post...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-background py-24">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href="/blog"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-muted-foreground">
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <span>{formatDate(post.date)}</span>
            <span className="mx-2">•</span>
            <span>{post.category}</span>
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {post.content}
        </div>
      </div>
    </article>
  );
} 