import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLetterDraft = async (
  template: string,
  details: string,
  schoolName: string
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Buatlah draft surat resmi untuk Sekolah Dasar ${schoolName}. 
    Jenis Surat: ${template}
    Detail Tambahan: ${details}
    
    Format output harus dalam JSON dengan struktur:
    {
      "nomor": "Nomor surat (gunakan placeholder jika tidak tahu)",
      "perihal": "Perihal surat",
      "tujuan": "Pihak yang dituju",
      "content": "Isi lengkap surat dalam format HTML sederhana (gunakan <p>, <br>, <ul>, <li>)",
      "tanggal": "Tanggal hari ini dalam format Indonesia"
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nomor: { type: Type.STRING },
          perihal: { type: Type.STRING },
          tujuan: { type: Type.STRING },
          content: { type: Type.STRING },
          tanggal: { type: Type.STRING }
        },
        required: ["nomor", "perihal", "tujuan", "content", "tanggal"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw error;
  }
};