import { NextResponse } from 'next/server';
import { getMediumPosts } from '@/lib/medium';

// Set cache control headers for better performance
export async function GET() {
  try {
    const posts = await getMediumPosts();
    
    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
      }
    });
  } catch (error) {
    console.error('Error in medium-posts API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Medium posts' },
      { status: 500 }
    );
  }
} 