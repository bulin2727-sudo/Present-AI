import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
// Fix: Import Buffer to ensure it is available in the environment
import { Buffer } from "buffer";

export async function POST(req: NextRequest) {
  try {
    // Securely access API Key from server environment variables
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server misconfiguration: API Key missing" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const rubricJson = formData.get("rubric") as string;
    const transcriptPreview = formData.get("transcript") as string || "";

    if (!audioFile || !rubricJson) {
      return NextResponse.json({ error: "Missing audio or rubric" }, { status: 400 });
    }

    // Convert Audio File to Base64 for Gemini
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const rubric = JSON.parse(rubricJson);
    const ai = new GoogleGenAI({ apiKey });

    // Construct a multimodal prompt
    const prompt = `
      You are an expert presentation coach.
      
      Task:
      1. Listen to the provided audio of a presentation.
      2. Evaluate it based strictly on the following rubric criteria.
      3. Use the provided "Transcript Preview" only as a reference for context if the audio is unclear, but prioritize the audio for tone and delivery analysis.

      Rubric:
      ${rubric.criteria.map((c: any) => `- ${c.name} (${c.weight}%): ${c.description}`).join('\n')}

      Transcript Preview (Reference):
      "${transcriptPreview.substring(0, 1000)}..."

      Provide the output in JSON format matching the specified schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: audioFile.type || 'audio/webm', data: base64Audio } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            criteriaBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criteriaId: { type: Type.STRING },
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json(JSON.parse(response.text));

  } catch (error: any) {
    console.error("Grading error:", error);
    return NextResponse.json({ error: error.message || "Failed to grade" }, { status: 500 });
  }
}