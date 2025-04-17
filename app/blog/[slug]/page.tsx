import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getMediumPosts } from '@/lib/medium';

// Define your blog posts data
const blogPosts = [
  {
    id: 1,
    title: "The Future of Solar Energy in India",
    slug: "future-of-solar-energy-india",
    content: `India's solar energy sector is witnessing unprecedented growth...`,
    coverImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&h=900&fit=crop",
    date: "2024-03-15",
    author: "Sanjib Kumar",
    authorRole: "Founder & Managing Director",
    category: "Renewable Energy"
  },
  {
    id: 2,
    title: "Digital Transformation in Energy Management",
    slug: "digital-transformation-energy-management",
    content: `The integration of digital technologies in energy management...`,
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop",
    date: "2024-03-10",
    author: "Vishrut Kumar",
    authorRole: "Chief Technology Officer",
    category: "Technology"
  }
];

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((post) => post.slug === params.slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Post not found</h1>
            <Link 
              href="/blog"
              className="inline-flex items-center text-primary hover:text-primary/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
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