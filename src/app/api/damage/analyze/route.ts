import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This API endpoint is deprecated. Please use client-side TensorFlow.js detection instead.',
      success: false,
      carDetected: false,
      damages: [],
      totalDamageScore: 0,
      estimatedRepairCost: 0
    },
    { status: 410 } // Gone
  );
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
