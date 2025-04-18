import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { getMediumPosts } from '@/lib/medium';

export const revalidate = 3600; // Revalidate every hour

export default async function BlogPage() {
  const posts = await getMediumPosts();

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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post.link} className="overflow-hidden flex flex-col">
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

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 