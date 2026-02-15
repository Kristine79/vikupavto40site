import { NextRequest, NextResponse } from "next/server";

// URL of the Python parts-pricing API with Hugging Face damage detection
const PARTS_API_URL = process.env.PARTS_API_URL || "http://localhost:8000";

// Handle file upload
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const image = formData.get("image") as File | null;

      if (!image) {
        return NextResponse.json(
          { success: false, error: "No image provided" },
          { status: 400 }
        );
      }

      // Convert file to blob and forward to Python API
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const formDataToSend = new FormData();
      const blob = new Blob([buffer], { type: image.type || "image/jpeg" });
      formDataToSend.append("image", blob, image.name || "image.jpg");

      const response = await fetch(`${PARTS_API_URL}/api/damage/detect`, {
        method: "POST",
        body: formDataToSend,
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
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      // Handle base64 encoded image
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
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Damage detection error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to detect damage" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", model: "Hugging Face DETR" });
}
