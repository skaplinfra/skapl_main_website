const functions = require('firebase-functions');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });

const MEDIUM_FEED_URL = 'https://medium.com/feed/@techinfra';

// Function to handle Medium post fetching
exports.mediumPosts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const parser = new Parser({
        customFields: {
          item: [
            ['content:encoded', 'content'],
            ['dc:creator', 'author'],
            ['category', 'categories'],
          ],
        },
      });
      
      const feed = await parser.parseURL(MEDIUM_FEED_URL);
      
      const posts = feed.items.map(item => {
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
          thumbnail,
        };
      });

      res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200');
      res.json(posts);
      
    } catch (error) {
      console.error('Error fetching Medium posts:', error);
      res.status(500).json({ error: 'Failed to fetch Medium posts' });
    }
  });
});

// Function to handle Turnstile verification
exports.verifyTurnstile = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { token, formType } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }
      
      // Determine which secret to use based on form type
      let secretKey;
      if (formType === 'contact') {
        secretKey = process.env.TURNSTILE_CONTACT_SECRET_KEY;
      } else if (formType === 'career') {
        secretKey = process.env.TURNSTILE_CAREER_SECRET_KEY;
      } else {
        return res.status(400).json({ error: 'Invalid form type' });
      }
      
      const verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);
      
      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        body: formData,
      });
      
      const data = await verifyResponse.json();
      res.json(data);
      
    } catch (error) {
      console.error('Error verifying Turnstile token:', error);
      res.status(500).json({ error: 'Failed to verify token' });
    }
  });
}); 