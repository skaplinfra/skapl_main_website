import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

// Use the same blog posts data
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

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12">Blog</h1>
        
        <div className="grid gap-12">
          {blogPosts.map((post) => (
            <article key={post.id} className="grid md:grid-cols-2 gap-8">
              <Link href={`/blog/${post.slug}`} className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </Link>
              
              <div className="flex flex-col">
                <div className="flex-1">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-block hover:text-primary transition-colors"
                  >
                    <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                  </Link>
                  <p className="text-muted-foreground mb-4">
                    {post.content.substring(0, 150)}...
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(post.date)}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
} 