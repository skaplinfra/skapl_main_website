export interface SubstackPost {
  title: string;
  link: string;
  pubDate: string;
  author: string;
  content: string;
  contentSnippet: string;
  guid: string;
  categories?: string[];
  thumbnail?: string;
}

const SUBSTACK_FEED_URL = 'https://skapl.substack.com/feed';

// Extract thumbnail from HTML content
function extractThumbnail(content: string): string {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  return match && match[1] ? match[1] : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80';
}

// Clean HTML content to plain text
function cleanContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
    .substring(0, 300);
}

// Parse RSS feed on client side using RSS2JSON service
export async function fetchSubstackPosts(): Promise<SubstackPost[]> {
  try {
    // Using rss2json.com as a CORS proxy for RSS feeds
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(SUBSTACK_FEED_URL)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch feed');
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok' || !data.items) {
      throw new Error('Invalid feed response');
    }
    
    const posts: SubstackPost[] = data.items.map((item: any) => {
      const thumbnail = item.thumbnail || extractThumbnail(item.description || item.content || '');
      const contentSnippet = cleanContent(item.description || item.content || '');
      
      return {
        title: item.title || 'Untitled',
        link: item.link || item.guid || '',
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.author || 'SKAPL',
        content: item.content || item.description || '',
        contentSnippet: contentSnippet,
        guid: item.guid || item.link || '',
        categories: item.categories || [],
        thumbnail: thumbnail
      };
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching Substack posts:', error);
    return [];
  }
}