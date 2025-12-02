import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const { text } = await req.json();

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Create a structured grading rubric from this text: "${text}". output JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  weight: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) throw new Error("No response");

    return NextResponse.json(JSON.parse(response.text));

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}