import React, { useState } from 'react';
import { AssignmentForm } from './components/AssignmentForm';
import { ResultDisplay } from './components/ResultDisplay';
import { generateAssignment } from './services/geminiService';
import { GeneratedContent, GenerationStatus, WritingStyle, AssignmentCategory, AssignmentConfig, OutputFormat } from './types';

export default function App() {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (
    prompt: string, 
    style: WritingStyle, 
    category: AssignmentCategory, 
    outputFormat: OutputFormat,
    config: AssignmentConfig, 
    pdfBase64?: string,
    wordText?: string
  ) => {
    setStatus(GenerationStatus.LOADING);
    setResult(null);
    setErrorMsg(null);

    try {
      const data = await generateAssignment(prompt, style, category, outputFormat, config, pdfBase64, wordText);
      setResult(data);
      setStatus(GenerationStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setStatus(GenerationStatus.ERROR);
      setErrorMsg("Gagal menghasilkan tugas. Pastikan file valid atau coba lagi nanti.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-md sticky top-0 z-10 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Siti Qoumariah's Sigment</h1>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
              Gemini 3 Pro Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        
        {/* Intro Banner */}
        {status === GenerationStatus.IDLE && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-lg">
            <div>
              <h2 className="text-lg font-semibold text-indigo-400 mb-2">Assalamu'alaikum, selamat dan sukses selalu</h2>
              <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Perkenalkan saya adalah aplikasi yang bisa membantu Anda menyusun draf tugas, esai, dan diskusi untuk seluruh mata kuliah S2 untuk semua jurusan. Fitur unggulan aplikasi ini: Analisis PDF & Word, referensi format RIS (Mendeley), dan ekspor dokumen Word. <br/>
                <span className="block mt-2 font-medium text-slate-400">I was developed @2025 by Liyas Syarifudin,M.Pd.</span>
              </p>
            </div>
          </div>
        )}

        <AssignmentForm onGenerate={handleGenerate} status={status} />

        {status === GenerationStatus.ERROR && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-300">{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {result && <ResultDisplay data={result} />}
        
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Siti Qoumariah's Sigment. Built with React & Gemini API.
          </p>
        </div>
      </footer>
    </div>
  );
}