import Parser from 'rss-parser';

type MediumPost = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories: string[];
  guid: string;
};

let parser: Parser = new Parser({
  customFields: {
    item: ['content:encoded', 'category']
  }
});

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const feed = await parser.parseURL('https://medium.com/feed/@thevishrutkumar');
    return feed.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      content: item['content:encoded'] || item.content || '',
      categories: Array.isArray(item.categories) ? item.categories : [],
      guid: item.guid || ''
    }));
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
} 