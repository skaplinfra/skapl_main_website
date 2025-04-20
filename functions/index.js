const functions = require('firebase-functions');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });
const admin = require('./admin');
const fs = require('fs');
const path = require('path');

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
        // Use environment variable directly (set during deployment)
        secretKey = process.env.TURNSTILE_CONTACT_SECRET;
      } else if (formType === 'career') {
        secretKey = process.env.TURNSTILE_CAREER_SECRET;
      } else {
        return res.status(400).json({ error: 'Invalid form type' });
      }
      
      if (!secretKey) {
        console.error('Missing Turnstile secret key');
        return res.status(500).json({ error: 'Server configuration error' });
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

// Next.js Server Function
exports.nextServer = functions.https.onRequest((req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  // Get the requested path
  const requestPath = req.path || '/';
  
  // The base directory where Next.js output is stored
  const nextDir = path.join(__dirname, '../.next');
  
  // Check if this is a static file request (e.g., JavaScript, CSS, images)
  if (requestPath.includes('.')) {
    const staticFilePath = path.join(nextDir, 'static', path.basename(requestPath));
    
    // Check if the file exists
    if (fs.existsSync(staticFilePath)) {
      // Set appropriate content type based on file extension
      const ext = path.extname(requestPath).toLowerCase();
      switch (ext) {
        case '.js':
          res.set('Content-Type', 'application/javascript');
          break;
        case '.css':
          res.set('Content-Type', 'text/css');
          break;
        case '.png':
          res.set('Content-Type', 'image/png');
          break;
        case '.jpg':
        case '.jpeg':
          res.set('Content-Type', 'image/jpeg');
          break;
        default:
          res.set('Content-Type', 'text/plain');
      }
      
      // Stream the file to the response
      fs.createReadStream(staticFilePath).pipe(res);
      return;
    }
  }
  
  // For non-static files, serve the HTML content
  try {
    // Default to index.html for the root path
    const htmlFile = requestPath === '/' 
      ? path.join(nextDir, 'server/pages/index.html')
      : path.join(nextDir, 'server/pages', `${requestPath}.html`);
    
    if (fs.existsSync(htmlFile)) {
      const htmlContent = fs.readFileSync(htmlFile, 'utf8');
      res.set('Content-Type', 'text/html');
      res.send(htmlContent);
    } else {
      // If no specific page exists, try serving the 404 page
      const notFoundPage = path.join(nextDir, 'server/pages/404.html');
      if (fs.existsSync(notFoundPage)) {
        const notFoundContent = fs.readFileSync(notFoundPage, 'utf8');
        res.status(404).set('Content-Type', 'text/html').send(notFoundContent);
      } else {
        res.status(404).send('Page not found');
      }
    }
  } catch (error) {
    console.error('Error serving Next.js content:', error);
    res.status(500).send('Internal Server Error');
  }
}); 