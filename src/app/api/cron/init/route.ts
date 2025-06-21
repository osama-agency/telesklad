import { NextRequest, NextResponse } from 'next/server';
import { initializeCronJobs } from '@/lib/cron/init-cron';

let cronInitialized = false;

export async function POST(request: NextRequest) {
  try {
    if (cronInitialized) {
      return NextResponse.json({ 
        success: true, 
        message: 'CRON jobs already initialized' 
      });
    }

    console.log('🚀 Initializing CRON jobs via API...');
    await initializeCronJobs();
    cronInitialized = true;

    return NextResponse.json({ 
      success: true, 
      message: 'CRON jobs initialized successfully' 
    });

  } catch (error) {
    console.error('❌ Error initializing CRON jobs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize CRON jobs' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    initialized: cronInitialized,
    message: cronInitialized ? 'CRON jobs are running' : 'CRON jobs not initialized'
  });
} 