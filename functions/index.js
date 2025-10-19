const functions = require('firebase-functions/v2');
const admin = require('./admin');
const cors = require('cors')({ origin: true });

// Load environment variables
require('dotenv').config();

// Helper to wrap with CORS
const corsHandler = (handler) => (req, res) => {
  return cors(req, res, () => handler(req, res));
};

/**
 * Career Form Submission API
 * Handles career applications with resume upload
 */
exports.career = functions.https.onRequest(
  { 
    region: 'asia-south1',
    timeoutSeconds: 120,
    memory: '512MiB'
  },
  corsHandler(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const formidable = require('formidable');
      const { Storage } = require('@google-cloud/storage');
      const { google } = require('googleapis');

      // Parse form data
      const form = formidable({ multiples: false });
      
      const parseForm = () => new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });

      const { fields, files } = await parseForm();
      
      // Extract form fields (formidable returns arrays for each field)
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
      const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
      const position_applied = Array.isArray(fields.position_applied) ? fields.position_applied[0] : fields.position_applied;
      const cover_letter = Array.isArray(fields.cover_letter) ? fields.cover_letter[0] : fields.cover_letter;
      const turnstileToken = Array.isArray(fields.turnstileToken) ? fields.turnstileToken[0] : fields.turnstileToken;
      const resumeFile = files.resume;

      // Validate required fields
      if (!name || !email || !position_applied || !turnstileToken || !resumeFile) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify Turnstile token
      const secretKey = process.env.TURNSTILE_CAREER_SECRET_KEY;
      if (secretKey) {
        const fetch = require('node-fetch');
        const verification = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: secretKey,
              response: turnstileToken,
            }),
          }
        );

        const verificationData = await verification.json();
        if (!verificationData.success) {
          return res.status(400).json({ error: 'Invalid captcha verification' });
        }
      }

      // Upload resume to Google Cloud Storage
      const storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      });

      const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);
      const timestamp = Date.now();
      const fileName = `resumes/${name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}_${resumeFile.originalFilename}`;
      const file = bucket.file(fileName);

      const fs = require('fs');
      const fileBuffer = fs.readFileSync(resumeFile.filepath);
      
      await file.save(fileBuffer, {
        metadata: {
          contentType: resumeFile.mimetype,
        },
      });

      await file.makePublic();
      const resumeUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;

      // Submit to Google Sheets
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const sheetId = process.env.GOOGLE_SHEET_ID_CRP;

      // Initialize sheet with headers if needed
      const checkHeaders = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A1:H1',
      });

      if (!checkHeaders.data.values || checkHeaders.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: 'A1:H1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              'Timestamp',
              'Name',
              'Email',
              'Phone',
              'Position Applied',
              'Cover Letter',
              'Resume Link',
              'Status'
            ]],
          },
        });
      }

      // Add application data
      const timestampStr = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A:H',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            timestampStr,
            name,
            email,
            phone || 'N/A',
            position_applied,
            cover_letter || 'N/A',
            resumeUrl,
            'New',
          ]],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Application submitted successfully',
      });

    } catch (error) {
      console.error('Error processing career application:', error);
      return res.status(500).json({
        error: error.message || 'Failed to submit application',
      });
    }
  })
);

/**
 * Contact Form Submission API
 * Handles contact form submissions
 */
exports.contact = functions.https.onRequest(
  { 
    region: 'asia-south1',
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  corsHandler(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { name, email, phone, company, message, turnstileToken } = req.body;

      // Validate required fields
      if (!name || !email || !message || !turnstileToken) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify Turnstile token
      const secretKey = process.env.TURNSTILE_CONTACT_SECRET_KEY;
      if (secretKey) {
        const fetch = require('node-fetch');
        const verification = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: secretKey,
              response: turnstileToken,
            }),
          }
        );

        const verificationData = await verification.json();
        if (!verificationData.success) {
          return res.status(400).json({ error: 'Invalid captcha verification' });
        }
      }

      // Submit to Google Sheets
      const { google } = require('googleapis');
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const sheetId = process.env.GOOGLE_SHEET_ID;

      // Initialize sheet with headers if needed
      const checkHeaders = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A1:G1',
      });

      if (!checkHeaders.data.values || checkHeaders.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: 'A1:G1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              'Timestamp',
              'Name',
              'Email',
              'Phone',
              'Company',
              'Message',
              'Status'
            ]],
          },
        });
      }

      // Add contact form data
      const timestampStr = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'A:G',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            timestampStr,
            name,
            email,
            phone || 'N/A',
            company || 'N/A',
            message,
            'New',
          ]],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully',
      });

    } catch (error) {
      console.error('Error processing contact form:', error);
      return res.status(500).json({
        error: error.message || 'Failed to submit contact form',
      });
    }
  })
);

