// Google Sheets helper for Cloud Functions
const { google } = require('googleapis');
const admin = require('./admin');

/**
 * Get authenticated Google Sheets client using Firebase Admin credentials
 * This eliminates the need for separate service account key management!
 */
const getSheetsClient = async () => {
  try {
    // Get the default Firebase app credentials
    const credential = admin.credential.applicationDefault();
    
    // Create auth client from Firebase credentials
    const authClient = await credential.getAccessToken();
    
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets API client');
  }
};

/**
 * Alternative: Use service account JSON string if provided
 */
const getSheetsClientFromEnv = () => {
  try {
    let credentials;

    // Try to get credentials from environment
    const keyString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (keyString) {
      try {
        credentials = JSON.parse(keyString);
      } catch (parseError) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY');
        throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY');
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    }

    // Fallback to default application credentials (works in Cloud Functions)
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw error;
  }
};

/**
 * Append contact form data to Google Sheets
 */
const appendContactToSheet = async (formData) => {
  try {
    const sheets = getSheetsClientFromEnv();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const row = [
      timestamp,
      formData.name,
      formData.email,
      formData.phone || 'N/A',
      formData.message,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log('Contact form data appended to Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    // Don't throw - let the form still work even if sheets fails
    return false;
  }
};

/**
 * Append career form data to Google Sheets
 */
const appendCareerToSheet = async (formData, resumeUrl) => {
  try {
    const sheets = getSheetsClientFromEnv();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_CRP;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID_CRP environment variable is not set');
    }

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const row = [
      timestamp,
      formData.name,
      formData.email,
      formData.phone || 'N/A',
      formData.position_applied,
      formData.cover_letter || 'N/A',
      resumeUrl,
      'New', // Status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log('Career form data appended to Google Sheets successfully');
    return true;
  } catch (error) {
    console.error('Error appending career data to Google Sheet:', error);
    // Don't throw - let the form still work even if sheets fails
    return false;
  }
};

module.exports = {
  appendContactToSheet,
  appendCareerToSheet,
};

