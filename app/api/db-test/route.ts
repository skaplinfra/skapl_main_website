import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if tables exist
    const { data: tableInfo, error: tableError } = await supabase
      .from('contact_submissions')
      .select('count()')
      .limit(1);
      
    if (tableError) {
      return NextResponse.json({ 
        success: false, 
        message: tableError.message,
        error: tableError
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection is working!',
      data: {
        contactSubmissionsCount: tableInfo && tableInfo.length > 0 ? tableInfo[0].count : 0,
      }
    });
  } catch (error) {
    console.error('DB test error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    }, { status: 500 });
  }
} 