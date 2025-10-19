'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { BookOpen, ExternalLink } from 'lucide-react';
import { fetchSubstackPosts, SubstackPost } from '@/lib/substack';

// Fallback data in case API fails
const FALLBACK_POSTS: SubstackPost[] = [
  {
    title: "Welcome to SKAPL Blog",
    link: "https://skapl.substack.com/",
    pubDate: new Date().toISOString(),
    content: "Discover insights, innovations, and stories from our team at SKAPL...",
    contentSnippet: "Discover insights, innovations, and stories from our team at SKAPL...",
    author: "SKAPL",
    guid: "fallback-1",
    thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
  },
  {
    title: "Innovation and Sustainability",
    link: "https://skapl.substack.com/",
    pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Exploring the intersection of technology and sustainable solutions...",
    contentSnippet: "Exploring the intersection of technology and sustainable solutions...",
    author: "SKAPL",
    guid: "fallback-2",
    thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"
  },
  {
    title: "Building for the Future",
    link: "https://skapl.substack.com/",
    pubDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Our journey in creating solutions that matter for tomorrow's challenges...",
    contentSnippet: "Our journey in creating solutions that matter for tomorrow's challenges...",
    author: "SKAPL",
    guid: "fallback-3",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState<SubstackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Mark as mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom theme change events
  useEffect(() => {
    const handleThemeChanged = () => {
      setTimeout(() => {
        setMounted(prev => {
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

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const substackPosts = await fetchSubstackPosts();
        
        if (substackPosts.length > 0) {
          setPosts(substackPosts);
        } else {
          setPosts(FALLBACK_POSTS);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // SSR safety - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">SKAPL Blog</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Insights, stories, and updates from our team
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">SKAPL Blog</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Insights, stories, and updates from our team
          </p>
          <Link 
            href="https://skapl.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <BookOpen className="w-5 h-5" />
            Subscribe to our newsletter
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4">Loading posts...</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card key={post.guid || index} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.thumbnail || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <span>{format(new Date(post.pubDate), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>{post.author}</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3 flex-1">
                    {post.contentSnippet}
                  </p>
                  <div className="mt-auto">
                    <Link 
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Read more
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No posts found.</p>
            <Link 
              href="https://skapl.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              Visit our Substack
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}