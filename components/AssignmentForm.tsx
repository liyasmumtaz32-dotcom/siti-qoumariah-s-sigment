import React, { useState, useRef } from 'react';
import { GenerationStatus, WritingStyle, AssignmentCategory, AssignmentConfig, OutputFormat } from '../types';

declare global {
  interface Window {
    mammoth: any;
  }
}

interface Props {
  onGenerate: (prompt: string, style: WritingStyle, category: AssignmentCategory, outputFormat: OutputFormat, config: AssignmentConfig, pdfBase64?: string, wordText?: string) => void;
  status: GenerationStatus;
}

export const AssignmentForm: React.FC<Props> = ({ onGenerate, status }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<WritingStyle>('FORMAL');
  const [category, setCategory] = useState<AssignmentCategory>('ESSAY');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('PARAGRAPH');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | undefined>(undefined);
  const [wordText, setWordText] = useState<string | undefined>(undefined);
  
  // New configuration state
  const [internationalRefs, setInternationalRefs] = useState<number>(5);
  const [nationalRefs, setNationalRefs] = useState<number>(3);
  const [pageCount, setPageCount] = useState<number>(5);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPdfBase64(undefined);
    setWordText(undefined);

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        setPdfBase64(base64String);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result;
        if (arrayBuffer && window.mammoth) {
          try {
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            setWordText(result.value);
            console.log("Word text extracted successfully");
          } catch (err) {
            console.error("Error parsing Word file:", err);
            alert("Gagal membaca file Word.");
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Mohon upload file PDF atau Word (.docx).");
      setFileName(null);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setPdfBase64(undefined);
    setWordText(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || pdfBase64 || wordText) {
      const finalPrompt = prompt.trim() || "Mohon kerjakan tugas berdasarkan instruksi yang terdapat dalam dokumen terlampir.";
      const config: AssignmentConfig = {
        internationalRefs,
        nationalRefs,
        pageCount
      };
      onGenerate(finalPrompt, style, category, outputFormat, config, pdfBase64, wordText);
    }
  };

  const isLoading = status === GenerationStatus.LOADING;
  const isSubmitDisabled = isLoading || (!prompt.trim() && !pdfBase64 && !wordText);

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Input Tugas / Topik
      </h2>
      <form onSubmit={handleSubmit}>
        
        {/* Grid for Category, Style and Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Column 1: Type, Style, Format */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Jenis Tugas</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssignmentCategory)}
                className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-400"
                disabled={isLoading}
              >
                <option value="ESSAY">Esai Akademis</option>
                <option value="CASE_STUDY">Studi Kasus (Case Study)</option>
                <option value="DISCUSSION">Diskusi Forum / Online</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Gaya Penulisan (Tone)</label>
              <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStyle('FORMAL')}
                    className={`p-2 rounded-md border text-center text-sm transition-all ${
                      style === 'FORMAL'
                        ? 'border-indigo-500 bg-indigo-900/50 text-indigo-300 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-indigo-400 hover:bg-slate-600'
                    }`}
                  >
                    Formal
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyle('CRITICAL')}
                    className={`p-2 rounded-md border text-center text-sm transition-all ${
                      style === 'CRITICAL'
                        ? 'border-indigo-500 bg-indigo-900/50 text-indigo-300 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-indigo-400 hover:bg-slate-600'
                    }`}
                  >
                    Kritis
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyle('PRACTICAL')}
                    className={`p-2 rounded-md border text-center text-sm transition-all ${
                      style === 'PRACTICAL'
                        ? 'border-indigo-500 bg-indigo-900/50 text-indigo-300 font-semibold ring-1 ring-indigo-500'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-indigo-400 hover:bg-slate-600'
                    }`}
                  >
                    Praktis
                  </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format Teks</label>
              <div className="flex space-x-4 bg-slate-700 p-2 rounded-lg border border-slate-600">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-500"
                    name="outputFormat"
                    value="PARAGRAPH"
                    checked={outputFormat === 'PARAGRAPH'}
                    onChange={() => setOutputFormat('PARAGRAPH')}
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-slate-300">Paragraf Biasa</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-500"
                    name="outputFormat"
                    value="BULLET_POINTS"
                    checked={outputFormat === 'BULLET_POINTS'}
                    onChange={() => setOutputFormat('BULLET_POINTS')}
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-slate-300">Bullet Points</span>
                </label>
              </div>
            </div>
          </div>

          {/* Column 2: Configuration (Refs & Pages) */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
             <h3 className="text-sm font-semibold text-slate-200 mb-3 border-b border-slate-700 pb-2">Konfigurasi Output</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Ref. Internasional</label>
                   <input 
                      type="number" 
                      min="0"
                      max="20"
                      value={internationalRefs}
                      onChange={(e) => setInternationalRefs(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500"
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-400 mb-1">Ref. Nasional</label>
                   <input 
                      type="number" 
                      min="0"
                      max="20"
                      value={nationalRefs}
                      onChange={(e) => setNationalRefs(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500"
                   />
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-medium text-slate-400 mb-1">
                      Estimasi Halaman <span className="text-slate-500 font-normal">(@~400 kata/hal)</span>
                   </label>
                   <div className="flex items-center">
                     <input 
                        type="number" 
                        min="1"
                        max="30"
                        value={pageCount}
                        onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white focus:ring-1 focus:ring-indigo-500"
                     />
                     <span className="ml-2 text-sm text-slate-400 w-24">
                        ≈ {pageCount * 400} kata
                     </span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Upload Dokumen Soal (PDF / Word) <span className="text-slate-500 font-normal ml-1">- Opsional</span></label>
          <div className="flex items-center space-x-3">
            <label className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg border border-dashed border-slate-600 bg-slate-700 hover:bg-slate-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input 
                type="file" 
                accept=".pdf,.docx" 
                className="hidden" 
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isLoading}
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-slate-300 font-medium">Pilih File</span>
            </label>
            
            {fileName && (
              <div className="flex items-center bg-indigo-900/30 border border-indigo-800 text-indigo-300 px-3 py-2 rounded-lg text-sm animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="max-w-[150px] truncate mr-2 font-medium">{fileName}</span>
                <button 
                  type="button" 
                  onClick={clearFile}
                  disabled={isLoading}
                  className="text-indigo-400 hover:text-red-400 hover:bg-red-900/50 rounded-full p-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
            Deskripsi Tugas atau Pertanyaan Diskusi
          </label>
          <textarea
            id="prompt"
            className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-white placeholder-slate-400"
            placeholder={fileName ? "Tambahkan instruksi spesifik terkait dokumen terlampir (Opsional)..." : "Contoh: Analisis strategi pemasaran Blue Ocean untuk industri telekomunikasi di Indonesia, bandingkan dengan strategi Red Ocean..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`
              flex items-center px-6 py-2.5 rounded-lg text-white font-medium transition-all shadow-md
              ${isSubmitDisabled 
                ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sedang Menganalisis...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Buat Tugas
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};