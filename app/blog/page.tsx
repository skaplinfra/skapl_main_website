'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { ClientMediumPost, fetchMediumPosts } from '@/lib/clientApi';

// Fallback data in case API fails
const FALLBACK_POSTS: ClientMediumPost[] = [
  {
    title: "Renewable Energy: The Path Forward",
    link: "https://medium.com/@techinfra/renewable-energy-the-path-forward",
    pubDate: new Date().toISOString(),
    content: "Exploring the latest innovations in renewable energy technology and how they're shaping our sustainable future...",
    author: "SKAPL Team",
    thumbnail: "https://miro.medium.com/max/1200/1*jFyawcsqoYctkTuZg6wQ1A.jpeg"
  },
  {
    title: "Smart Solutions for Modern Energy Challenges",
    link: "https://medium.com/@techinfra/smart-solutions-for-modern-energy-challenges",
    pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: "How AI and data analytics are transforming the way we manage and distribute energy resources...",
    author: "SKAPL Team",
    thumbnail: "https://miro.medium.com/max/1200/1*-hQb0rUVucwVHF3k0qU8Yw.jpeg"
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState<ClientMediumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        const mediumPosts = await fetchMediumPosts();
        
        if (mediumPosts.length > 0) {
          setPosts(mediumPosts);
        } else {
          // Use fallback data if no posts were returned
          setPosts(FALLBACK_POSTS);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
        // Use fallback data if fetch fails
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights, updates, and stories from the SKAPL team
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Card key={index} className="overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized // Since we're using external images
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
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="mt-auto">
                    <Link 
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 