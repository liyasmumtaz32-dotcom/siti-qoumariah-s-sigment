import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent, WritingStyle, AssignmentCategory, AssignmentConfig, OutputFormat } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const referenceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "Type of reference: JOUR (Journal), BOOK (Book), or WEB (Website)" },
    author: { type: Type.STRING, description: "Author names (e.g., Kotler, P. & Keller, K.L.)" },
    year: { type: Type.STRING },
    title: { type: Type.STRING },
    publication: { type: Type.STRING, description: "Name of Journal or Publisher" },
    volume: { type: Type.STRING, nullable: true },
    issue: { type: Type.STRING, nullable: true },
    pages: { type: Type.STRING, nullable: true },
    doi: { type: Type.STRING, nullable: true },
    url: { type: Type.STRING, nullable: true },
  },
  required: ["type", "author", "year", "title", "publication"],
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    essayTitle: { type: Type.STRING },
    introduction: { type: Type.STRING, description: "Comprehensive introduction discussing the background and importance." },
    bodyParagraphs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          content: { type: Type.STRING, description: "Detailed analysis with in-text citations. MUST be long and detailed." },
        },
        required: ["heading", "content"],
      },
    },
    conclusion: { type: Type.STRING, description: "Summary and strategic recommendations." },
    references: {
      type: Type.ARRAY,
      items: referenceSchema,
      description: "List of credible sources used in the essay.",
    },
  },
  required: ["essayTitle", "introduction", "bodyParagraphs", "conclusion", "references"],
};

export const generateAssignment = async (
  prompt: string, 
  style: WritingStyle, 
  category: AssignmentCategory, 
  outputFormat: OutputFormat,
  config: AssignmentConfig, 
  pdfBase64?: string,
  wordText?: string
): Promise<GeneratedContent> => {
  let styleInstruction = "";
  let categoryInstruction = "";
  let formatInstruction = "";

  // Define Tone/Style
  switch (style) {
    case 'CRITICAL':
      styleInstruction = `
        GAYA BAHASA (TONE): KRITIS ANALITIS (HUMAN LEVEL)
        - Anda harus berdebat dengan teori, bukan sekadar menjelaskannya.
        - Gunakan kalimat aktif dan variasikan panjang kalimat (pendek vs panjang) untuk menciptakan ritme alami.
        - Hindari kata-kata klise AI seperti "Sebagai kesimpulan", "Penting untuk dicatat", "Dalam era digital ini". Gunakan transisi yang lebih organik.
      `;
      break;
    case 'PRACTICAL':
      styleInstruction = `
        GAYA BAHASA (TONE): PRAKTIS & DIRECT
        - Tulis seolah-olah Anda adalah konsultan ahli yang sedang berbicara kepada klien.
        - Gunakan analogi dunia nyata yang spesifik (bukan general).
        - Fokus pada 'Actionable Insights'.
      `;
      break;
    case 'FORMAL':
    default:
      styleInstruction = `
        GAYA BAHASA (TONE): AKADEMIS MENDALAM
        - Tulis dengan 'Perplexity' tinggi: Gunakan kosa kata yang spesifik dan struktur kalimat kompleks namun efektif.
        - Hindari repetisi struktur kalimat.
        - Tunjukkan nuansa pemikiran manusia (human nuance) dengan menghubungkan konsep yang tampaknya tidak berhubungan.
      `;
      break;
  }

  // Define Structure based on Category
  switch (category) {
    case 'CASE_STUDY':
      categoryInstruction = `
        JENIS TUGAS: STUDI KASUS (CASE STUDY)
        - Struktur: Masalah -> Analisis Data -> Alternatif Solusi -> Rekomendasi.
        - Gunakan data hipotetis yang logis jika tidak disediakan dalam soal.
      `;
      break;
    case 'DISCUSSION':
      categoryInstruction = `
        JENIS TUGAS: DISKUSI FORUM
        - Gaya bahasa lebih personal namun tetap berbasis teori.
        - Langsung menjawab inti pertanyaan tanpa pendahuluan yang bertele-tele.
      `;
      break;
    case 'ESSAY':
    default:
      categoryInstruction = `
        JENIS TUGAS: ESAI AKADEMIS
        - Alur pemikiran harus mengalir (flow) secara natural, bukan seperti poin-poin yang disambung paksa.
        - Setiap paragraf harus memiliki satu ide pokok yang dikembangkan secara mendalam.
      `;
      break;
  }

  // Define Output Format
  if (outputFormat === 'BULLET_POINTS') {
    formatInstruction = `
      FORMAT OUTPUT: POIN-POIN (BULLET POINTS)
      - Sajikan isi pembahasan (Body Paragraphs) dalam bentuk poin-poin (bullet points) yang terstruktur dan detail.
      - Meskipun berbentuk poin, setiap poin harus berupa kalimat lengkap dan analitis, bukan sekadar frasa pendek.
      - Pendahuluan dan Kesimpulan tetap dalam bentuk paragraf narasi.
    `;
  } else {
    formatInstruction = `
      FORMAT OUTPUT: PARAGRAF NARASI (DEFAULT)
      - Sajikan isi pembahasan dalam bentuk paragraf narasi yang mengalir (standard essay format).
      - Pastikan transisi antar paragraf halus dan koheren.
    `;
  }

  const wordCountTarget = config.pageCount * 400;

  const systemInstruction = `
    Anda adalah seorang mahasiswa S2 Manajemen Pemasaran yang cerdas dan berwawasan luas.
    
    TUJUAN UTAMA:
    Hasilkan tulisan yang **100% TERDETEKSI SEBAGAI MANUSIA** dan **BEBAS PLAGIARISME**.
    
    INSTRUKSI "HUMANIZER" (WAJIB IKUTI):
    1. **Burstiness & Perplexity**: Variasikan struktur kalimat Anda secara ekstrem. Campurkan kalimat pendek yang tegas dengan kalimat majemuk bertingkat yang kompleks. Jangan biarkan pola kalimat menjadi monoton atau robotik.
    2. **Hindari Frasa AI**: DILARANG KERAS menggunakan frasa pembuka standar AI seperti: "Pada zaman modern ini", "Dapat disimpulkan bahwa", "Selanjutnya", "Di sisi lain". Gunakan transisi yang lebih natural dan tersirat.
    3. **Opini & Suara**: Jangan netral. Ambil sudut pandang, dukung dengan teori, lalu kritisi teori tersebut jika perlu. Tunjukkan keterlibatan intelektual.
    4. **Spesifisitas**: Jangan gunakan contoh umum (misal: "perusahaan teknologi"). Gunakan contoh spesifik (misal: "GoTo saat merger" atau "Strategi pivot Netflix").
    5. **Parafrase Semantik**: Jangan hanya mengganti sinonim. Tulis ulang ide teori menggunakan pemahaman Anda sendiri.

    ${categoryInstruction}
    ${styleInstruction}
    ${formatInstruction}
    
    TARGET OUTPUT:
    - Panjang Konten: Sekitar ${wordCountTarget} kata (Estimasi ${config.pageCount} halaman). Kembangkan analisis secara mendalam untuk mencapai target ini.
    - Referensi: Minimal ${config.internationalRefs} Jurnal Internasional dan ${config.nationalRefs} Jurnal Nasional. Gunakan referensi nyata (Real citations) tahun 2018-2024.
    
    Pastikan output dalam format JSON sesuai schema.
  `;

  try {
    const parts: any[] = [];
    
    // 1. PDF Handling
    if (pdfBase64) {
      parts.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64
        }
      });
    }
    
    // 2. Word Doc Handling (Extracted Text)
    let finalPrompt = prompt;
    if (wordText) {
      finalPrompt = `${prompt}\n\n[BERIKUT ADALAH ISI DOKUMEN REFERENSI YANG HARUS DIANALISIS]:\n${wordText}`;
    }

    // Add the text prompt
    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};