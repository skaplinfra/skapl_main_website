import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { CareerFormData } from './schemas';

// Initialize Google Sheets API
const getSheetsClient = () => {
  try {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    
    if (!keyPath) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_PATH is not set in environment variables');
    }

    const credentials = JSON.parse(readFileSync(keyPath, 'utf-8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets API client');
  }
};

// Initialize sheet with headers if it's empty
export const initializeSheet = async () => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_CRP;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID_CRP is not set in environment variables');
    }

    const sheets = getSheetsClient();

    // Check if sheet has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:H1',
    });

    // If no headers, add them
    if (!response.data.values || response.data.values.length === 0) {
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
      
      console.log('Sheet initialized with headers');
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    throw new Error('Failed to initialize Google Sheet');
  }
};

// Submit career application to Google Sheets
export const submitToGoogleSheets = async (
  formData: CareerFormData,
  resumeUrl: string
) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_CRP;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID_CRP is not set in environment variables');
    }

    const sheets = getSheetsClient();

    // Prepare row data
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const rowData = [
      timestamp,
      formData.name,
      formData.email,
      formData.phone || 'N/A',
      formData.position_applied,
      formData.cover_letter || 'N/A',
      resumeUrl,
      'New', // Status column
    ];

    // Append the row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A:H',
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData],
      },
    });

    console.log('Data appended to Google Sheets successfully');
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    throw new Error('Failed to submit to Google Sheets');
  }
};

// Get all applications from sheet
export const getAllApplications = async () => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_CRP;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID_CRP is not set');
    }

    const sheets = getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:H',
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Failed to fetch applications from Google Sheets');
  }
};

// Update application status
export const updateApplicationStatus = async (
  rowIndex: number,
  status: string
) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_CRP;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID_CRP is not set');
    }

    const sheets = getSheetsClient();
    
    // Update status column (column H)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `H${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[status]],
      },
    });

    console.log(`Application status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

// Verify Turnstile token
export const verifyTurnstile = async (token: string): Promise<boolean> => {
  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('TURNSTILE_SECRET_KEY not set, skipping verification');
      return true;
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
};