import Parser from 'rss-parser';

export type MediumPost = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  author: string;
  categories: string[];
  thumbnail: string;
};

const MEDIUM_FEED_URL = 'https://medium.com/feed/@techinfra';
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'content'],
      ['dc:creator', 'author'],
      ['category', 'categories'],
    ],
  },
});

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const feed = await parser.parseURL(MEDIUM_FEED_URL);
    
    return feed.items.map(item => {
      // Extract the first image from the content as thumbnail
      const thumbnailMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
      const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '/blog-placeholder.jpg';

      // Clean up content by removing HTML tags
      const cleanContent = item.content
        ?.replace(/<[^>]+>/g, '') // Remove HTML tags
        ?.replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        ?.substring(0, 200) + '...'; // Truncate for preview

      return {
        title: item.title || 'Untitled Post',
        link: item.link || '#',
        pubDate: item.pubDate || new Date().toISOString(),
        content: cleanContent || '',
        author: item.author || 'SKAPL Team',
        categories: Array.isArray(item.categories) ? item.categories : [],
        thumbnail,
      };
    });
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
} 