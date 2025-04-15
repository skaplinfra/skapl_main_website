import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { getMediumPosts } from '@/lib/medium';

export default async function BlogPage() {
  const posts = await getMediumPosts();

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">SKAPL Blog</h1>
          <p className="text-xl text-muted-foreground">
            Insights and updates from our CTO on technology, innovation, and industry trends
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const slug = post.guid.split('/').pop() || '';
            const coverImage = post.content.match(/<img[^>]+src="([^">]+)"/)?.[1] || 
              'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80';
            
            // Extract excerpt from content
            const excerpt = post.content
              .replace(/<[^>]+>/g, '') // Remove HTML tags
              .slice(0, 150) // Get first 150 characters
              .trim() + '...';

            return (
              <Link key={post.guid} href={`/blog/${slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <Image
                      src={coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      {post.categories.slice(0, 1).map((category, index) => (
                        <span key={index} className="text-sm text-primary font-medium">
                          {category}
                        </span>
                      ))}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.pubDate)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {excerpt}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>By Vishrut Kumar</span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 