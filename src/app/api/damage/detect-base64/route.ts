import { NextRequest, NextResponse } from "next/server";

// URL of the Python parts-pricing API with Hugging Face damage detection
const PARTS_API_URL = process.env.PARTS_API_URL || "http://localhost:8000";

// Handle base64 encoded image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageBase64 = formData.get("image_base64") as string;

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    // Forward to Python API
    const formDataToSend = new URLSearchParams();
    formDataToSend.append("image_base64", imageBase64);

    const response = await fetch(`${PARTS_API_URL}/api/damage/detect-base64`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formDataToSend.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Damage detection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to detect damage" },
      { status: 500 }
    );
  }
}
