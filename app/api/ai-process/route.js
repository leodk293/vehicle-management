import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
    const { input } = await req.json();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: input,
            config: {
                systemInstruction: `You are a helpful AI assistant for a vehicle management and location web application. 
You help users with tasks such as tracking, managing, and finding details about vehicles in a fleet, including their current location, maintenance status, utilization, and assignments. 
When asked, provide clear and concise answers related to vehicle operations, suggest best practices for fleet efficiency, and guide users on how to use app features for reporting, monitoring, and compliance. 
Always communicate in a professional and friendly manner, focusing on delivering accurate and actionable information.`,
           
            },
        });

        const content = response.text; // ✅ getter in latest @google/genai SDK

        return NextResponse.json({ message: content });
    } catch (err) {
        console.error("Full AI error:", JSON.stringify(err, null, 2));
        console.error("Error message:", err.message);
        console.error("Error status:", err.status);   // Gemini SDK exposes this

        return NextResponse.json(
            { error: err.message || "Failed to fetch response from AI" },
            { status: 500 }
        );
    }
}