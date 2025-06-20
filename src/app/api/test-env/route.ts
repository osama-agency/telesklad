import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ? '***' : 'undefined',
    S3_SECRET_KEY: process.env.S3_SECRET_KEY ? '***' : 'undefined',
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
} 