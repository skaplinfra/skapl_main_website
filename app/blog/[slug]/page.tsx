import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getMediumPosts } from '@/lib/medium';

// This function runs at build time
export async function generateStaticParams() {
  const posts = await getMediumPosts();
  return posts.map((post) => ({
    slug: post.guid.split('/').pop() || '',
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const posts = await getMediumPosts();
  const post = posts.find(post => post.guid.split('/').pop() === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Link href="/blog" className="text-primary hover:underline">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  // Extract the first image from the content if available
  const coverImage = post.content.match(/<img[^>]+src="([^">]+)"/)?.[1] || 
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-background py-24">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/blog"
          className="inline-flex items-center text-primary hover:underline mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {post.categories.map((category, index) => (
              <span key={index} className="text-primary font-medium">
                {category}
              </span>
            ))}
            <span className="text-muted-foreground">
              {formatDate(post.pubDate)}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">By</span>
            <span className="font-medium">Vishrut Kumar</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Chief Technology Officer</span>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
} 