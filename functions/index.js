const functions = require('firebase-functions');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const cors = require('cors')({ origin: true });
const admin = require('./admin');
const { createClient } = require('@supabase/supabase-js');

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

// Function to handle contact form submissions
exports.submitContactForm = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { name, email, phone, message, turnstileToken } = req.body;
      
      if (!name || !email || !message || !turnstileToken) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Verify turnstile token first
      const verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', process.env.TURNSTILE_CONTACT_SECRET);
      formData.append('response', turnstileToken);
      
      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        body: formData,
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        return res.status(400).json({ error: 'Invalid security token' });
      }
      
      // Initialize Supabase client
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name,
            email,
            phone: phone || null,
            message
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      return res.status(200).json({ success: true, data });
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Function to handle career form submissions
exports.submitCareerForm = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // We need to handle multipart form data for file uploads
      // For simplicity, we'll accept JSON for now and add file upload later
      const { name, email, phone, position_applied, cover_letter, turnstileToken } = req.body;
      
      if (!name || !email || !position_applied || !turnstileToken) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Verify turnstile token first
      const verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', process.env.TURNSTILE_CAREER_SECRET);
      formData.append('response', turnstileToken);
      
      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        body: formData,
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        return res.status(400).json({ error: 'Invalid security token' });
      }
      
      // Initialize Supabase client
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY
      );
      
      // For now, create a mock resume URL (in a real implementation, we'd upload the file)
      const resumeUrl = `https://example.com/mock-resume-${Date.now()}.pdf`;
      
      // Insert data into Supabase
      const { data, error } = await supabase
        .from('career_applications')
        .insert([
          {
            name,
            email,
            phone: phone || null,
            position_applied,
            cover_letter: cover_letter || null,
            resume_url: resumeUrl
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      
      return res.status(200).json({ success: true, data });
      
    } catch (error) {
      console.error('Career form submission error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
}); 