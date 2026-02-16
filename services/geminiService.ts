
import { GoogleGenAI } from "@google/genai";
import { AttendanceLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAttendanceInsights = async (logs: AttendanceLog[], userName: string) => {
  try {
    const prompt = `Based on the following attendance logs for ${userName}, provide a short, encouraging 2-sentence summary/insight about their punctuality and presence. Keep it professional and motivational.
    Logs: ${JSON.stringify(logs.map(l => ({ date: l.date, status: l.status, in: l.checkInTime, out: l.checkOutTime })))}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful HR AI assistant for the BlueMark attendance app.",
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep up the great work! Your consistency is the key to our team's success.";
  }
};
