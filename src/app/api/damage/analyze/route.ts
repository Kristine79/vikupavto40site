import { NextRequest, NextResponse } from 'next/server';
import { analyzeCarDamage } from '@/lib/car-damage-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided', success: false, damages: [], carDetected: false, totalDamageScore: 0, estimatedRepairCost: 0 },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(image, 'base64');
    } catch {
      return NextResponse.json(
        { error: 'Invalid base64 image data', success: false, damages: [], carDetected: false, totalDamageScore: 0, estimatedRepairCost: 0 },
        { status: 400 }
      );
    }

    // Check if buffer has valid image data
    if (buffer.length < 100) {
      return NextResponse.json(
        { error: 'Image data too small', success: false, damages: [], carDetected: false, totalDamageScore: 0, estimatedRepairCost: 0 },
        { status: 400 }
      );
    }

    // Analyze the image
    const result = await analyzeCarDamage(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Damage analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        carDetected: false,
        damages: [],
        totalDamageScore: 0,
        estimatedRepairCost: 0
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
