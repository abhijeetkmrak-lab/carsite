import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, color, finish } = body;

    if (!image) {
      return NextResponse.json({ error: "Input image is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash-001 for specific version compatibility
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    // Remove the data URL prefix if present
    const base64Data = image.split(",")[1] || image;

    const prompt = `
      Perform high-end image-to-image editing on this car photo:
      1. Change the car's primary body color to a vibrant ${color}.
      2. Apply a professional ${finish} finish to the paintwork.
      3. Place the car in a premium, dark-themed virtual showroom.
      4. Ensure the car is centered on a sleek, metallic circular platform.
      5. Use dramatic studio lighting with realistic reflections on the car body.
      6. Maintain the original car's shape, model, and perspective perfectly.
      
      Return ONLY the edited image.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini");
    }

    // Extract the image part from the generated content
    const imagePart = candidates[0].content.parts.find((part) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error("No image data found in Gemini response. The model might have returned text instead.");
    }

    const editedBase64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/jpeg";

    return NextResponse.json({
      success: true,
      image: `data:${mimeType};base64,${editedBase64}`,
    });
  } catch (error: any) {
    console.error("Gemini Customization Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image with AI" },
      { status: 500 }
    );
  }
}
