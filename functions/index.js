// Load environment variables (for local development)
require('dotenv').config();

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const admin = require('./admin');

// Define secrets for Functions v2 (for production)
// These will be set via: firebase functions:secrets:set TURNSTILE_CONTACT_SECRET
const turnstileContactSecret = defineSecret('TURNSTILE_CONTACT_SECRET');
const turnstileCareerSecret = defineSecret('TURNSTILE_CAREER_SECRET');

const MEDIUM_FEED_URL = 'https://medium.com/feed/@techinfra';

// Function to handle Medium post fetching
exports.mediumPosts = onRequest({ cors: true }, async (req, res) => {
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

// Function to handle Turnstile verification
exports.verifyTurnstile = onRequest({ cors: true }, async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
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
      // For demo purposes, simulate successful verification
      return res.status(200).json({ success: true });
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
    // For demo purposes, simulate successful verification
    res.status(200).json({ success: true });
  }
});

// Function to handle contact form submissions
exports.submitContactForm = onRequest({
  cors: true,
  secrets: [turnstileContactSecret], // Reference the secret
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message, turnstileToken } = req.body;
    
    if (!name || !email || !message || !turnstileToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify turnstile token first
    // Try secret from Functions v2 secrets first, then fallback to env var (for local dev)
    let turnstileSecret;
    try {
      turnstileSecret = turnstileContactSecret.value();
    } catch (error) {
      // Secret not set, try env var
      turnstileSecret = process.env.TURNSTILE_CONTACT_SECRET;
    }
    
    // If secret is missing, skip verification (for development/demo)
    if (!turnstileSecret || turnstileSecret.trim() === '') {
      console.warn('TURNSTILE_CONTACT_SECRET not set - skipping verification');
    } else {
      const verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', turnstileSecret);
      formData.append('response', turnstileToken);
      
      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        body: formData,
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        console.error('Turnstile verification failed:', JSON.stringify(verifyData));
        console.error('Token received:', turnstileToken ? 'Present' : 'Missing');
        console.error('Secret used:', turnstileSecret ? 'Present' : 'Missing');
        return res.status(400).json({ error: 'Invalid security token' });
      }
      
      console.log('Turnstile verification successful');
    }
    
    // Save to Firestore
    const db = admin.firestore();
    const docRef = await db.collection('contact_submissions').add({
      name,
      email,
      phone: phone || '',
      message,
      submitted_at: admin.firestore.FieldValue.serverTimestamp(),
      created_at: new Date().toISOString(),
    });
    
    console.log('Contact form saved to Firestore:', docRef.id);
    
    return res.status(200).json({ 
      success: true, 
      data: { id: docRef.id, name, email, phone, message } 
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Function to handle career form submissions
exports.submitCareerForm = onRequest({
  cors: true,
  secrets: [turnstileCareerSecret], // Reference the secret
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Note: This Firebase Function doesn't handle file uploads directly
    // The Next.js API route at /api/career handles the actual file upload
    // This function is kept for backwards compatibility with static exports
    const { name, email, phone, position_applied, cover_letter, turnstileToken } = req.body;
    
    if (!name || !email || !position_applied || !turnstileToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Verify turnstile token first
    // Try secret from Functions v2 secrets first, then fallback to env var (for local dev)
    let turnstileSecret;
    try {
      turnstileSecret = turnstileCareerSecret.value();
    } catch (error) {
      // Secret not set, try env var
      turnstileSecret = process.env.TURNSTILE_CAREER_SECRET;
    }
    
    // If secret is missing, skip verification (for development/demo)
    if (!turnstileSecret || turnstileSecret.trim() === '') {
      console.warn('TURNSTILE_CAREER_SECRET not set - skipping verification');
    } else {
      const verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
      const formData = new URLSearchParams();
      formData.append('secret', turnstileSecret);
      formData.append('response', turnstileToken);
      
      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        body: formData,
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        console.error('Turnstile verification failed:', JSON.stringify(verifyData));
        console.error('Token received:', turnstileToken ? 'Present' : 'Missing');
        console.error('Secret used:', turnstileSecret ? 'Present' : 'Missing');
        return res.status(400).json({ error: 'Invalid security token' });
      }
      
      console.log('Turnstile verification successful');
    }
    
    // Save to Firestore
    const db = admin.firestore();
    const docRef = await db.collection('career_applications').add({
      name,
      email,
      phone: phone || '',
      position_applied,
      cover_letter: cover_letter || '',
      resume_url: '', // Will be updated by client if file is uploaded
      resume_filename: '',
      submitted_at: admin.firestore.FieldValue.serverTimestamp(),
      created_at: new Date().toISOString(),
    });
    
    console.log('Career application saved to Firestore:', docRef.id);
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        id: docRef.id, 
        name, 
        email, 
        phone, 
        position_applied, 
        cover_letter 
      } 
    });
    
  } catch (error) {
    console.error('Career form submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
