import { google } from 'googleapis';
import { ContactFormData } from '@/lib/schemas';

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  try {
    let credentials;

    // Check if using file path (for local development)
    const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    const keyString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (keyFilePath) {
      // Use file path (local development)
      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    } else if (keyString) {
      // Parse JSON string (production/deployment)
      try {
        credentials = JSON.parse(keyString);
      } catch (parseError) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY. Make sure it is valid JSON.');
        console.error('First 100 chars:', keyString.substring(0, 100));
        throw new Error('Invalid JSON in GOOGLE_SERVICE_ACCOUNT_KEY');
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      return google.sheets({ version: 'v4', auth });
    } else {
      throw new Error('Neither GOOGLE_SERVICE_ACCOUNT_KEY_PATH nor GOOGLE_SERVICE_ACCOUNT_KEY is set');
    }
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    throw error;
  }
};

/**
 * Append form data to Google Sheet
 * @param formData - The contact form data to append
 */
export async function appendToSheet(formData: ContactFormData) {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }

    // Prepare the row data
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      formData.name,
      formData.email,
      formData.phone || '',
      formData.message,
    ];

    // Append the row to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:E', // Adjust sheet name and range as needed
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    console.log('Successfully appended to sheet:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    throw new Error('Failed to save form data to Google Sheet');
  }
}

/**
 * Initialize the sheet with headers if it's empty
 */
export async function initializeSheet() {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }

    // Check if sheet has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:E1',
    });

    // If no headers exist, add them
    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:E1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Timestamp', 'Name', 'Email', 'Phone', 'Message']],
        },
      });
      console.log('Sheet headers initialized');
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    // Don't throw error here, as sheet might already be initialized
  }
}