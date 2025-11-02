import { NextResponse } from 'next/server';
import { diagnoseFirebase } from '@/lib/firebase-diagnostic';

export async function GET() {
  try {
    await diagnoseFirebase();
    return NextResponse.json({ 
      success: true, 
      message: 'Check your server console for diagnostic results'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

