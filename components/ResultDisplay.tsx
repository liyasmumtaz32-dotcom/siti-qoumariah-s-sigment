import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import { generateRisFile, generateWordDoc, downloadFile } from '../utils/exportUtils';

interface Props {
  data: GeneratedContent;
}

export const ResultDisplay: React.FC<Props> = ({ data }) => {
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleExportRIS = () => {
    const blob = generateRisFile(data.references);
    downloadFile(blob, 'referensi_mendeley.ris');
  };

  const handleExportWord = () => {
    const blob = generateWordDoc(data);
    downloadFile(blob, 'tugas_manajemen_pemasaran.doc');
  };

  const getFullText = () => {
    return `${data.essayTitle}\n\n${data.introduction}\n\n${data.bodyParagraphs.map(p => `${p.heading}\n${p.content}`).join('\n\n')}\n\n${data.conclusion}`;
  };

  const handleCopyForPlagiarism = () => {
    const text = getFullText();
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Essay Content */}
      <div className="bg-slate-800 rounded-xl shadow-md border border-slate-700 overflow-hidden">
        <div className="bg-slate-700/50 border-b border-slate-700 px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg font-bold text-white font-serif">{data.essayTitle}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPlagiarismModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-900/50 text-indigo-300 text-sm font-medium rounded-lg hover:bg-indigo-800/50 transition-colors shadow-sm border border-indigo-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cek Plagiarisme
            </button>
            <button
              onClick={handleExportWord}
              className="flex items-center px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Word
            </button>
          </div>
        </div>

        <div className="p-8 font-serif leading-relaxed text-slate-300 text-justify">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-white">Pendahuluan</h3>
            <p className="whitespace-pre-wrap">{data.introduction}</p>
          </div>

          {data.bodyParagraphs.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-white">{section.heading}</h3>
              <p className="whitespace-pre-wrap">{section.content}</p>
            </div>
          ))}

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-white">Kesimpulan</h3>
            <p className="whitespace-pre-wrap">{data.conclusion}</p>
          </div>
        </div>
      </div>

      {/* References Section */}
      <div className="bg-slate-800 rounded-xl shadow-md border border-slate-700 overflow-hidden">
        <div className="bg-slate-700/50 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Daftar Pustaka (Referensi)</h3>
          <button
            onClick={handleExportRIS}
            className="flex items-center px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export ke Mendeley (.ris)
          </button>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            {data.references.map((ref, idx) => (
              <li key={idx} className="flex flex-col text-sm text-slate-300 pl-4 border-l-4 border-slate-600">
                <span className="font-semibold text-slate-200">{ref.author} ({ref.year})</span>
                <span className="italic">{ref.title}</span>
                <span>
                  {ref.publication}
                  {ref.volume && `, Vol. ${ref.volume}`}
                  {ref.issue && `, No. ${ref.issue}`}
                  {ref.pages && `, Hal. ${ref.pages}`}
                </span>
                {ref.doi && (
                    <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline mt-1">
                        DOI: {ref.doi}
                    </a>
                )}
                <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{ref.type === 'JOUR' ? 'Jurnal' : ref.type === 'BOOK' ? 'Buku' : 'Website'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Plagiarism Modal */}
      {showPlagiarismModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in border border-slate-700">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-700/50">
              <h3 className="text-lg font-bold text-white">Alat Periksa Plagiarisme</h3>
              <button onClick={() => setShowPlagiarismModal(false)} className="text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-300 mb-4 text-sm">
                Salin konten esai Anda dan gunakan salah satu alat eksternal tepercaya di bawah ini untuk memeriksa tingkat orisinalitas dan skor AI.
              </p>
              
              <div className="mb-6">
                <div className="bg-slate-700 rounded-lg p-3 flex items-center justify-between mb-2 border border-slate-600">
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]">
                    {data.essayTitle}...
                  </span>
                  <button
                    onClick={handleCopyForPlagiarism}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                      copyStatus === 'copied' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {copyStatus === 'copied' ? 'Tersalin!' : 'Salin Semua Teks'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Klik tombol salin di atas sebelum membuka alat pemeriksa.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://www.duplichecker.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-600 hover:border-indigo-500 hover:bg-indigo-900/30 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-300 flex items-center justify-center mr-3 font-bold text-xs border border-blue-800">DC</div>
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-indigo-300">DupliChecker</h4>
                      <p className="text-xs text-slate-400">Gratis, cek plagiarisme dasar</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://smallseotools.com/plagiarism-checker/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-600 hover:border-indigo-500 hover:bg-indigo-900/30 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center mr-3 font-bold text-xs border border-red-800">SST</div>
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-indigo-300">Small SEO Tools</h4>
                      <p className="text-xs text-slate-400">Populer untuk cek dokumen</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                <a
                  href="https://copyleaks.com/ai-content-detector"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-600 hover:border-indigo-500 hover:bg-indigo-900/30 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center mr-3 font-bold text-xs border border-purple-800">AI</div>
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-indigo-300">CopyLeaks AI Detector</h4>
                      <p className="text-xs text-slate-400">Khusus deteksi konten AI</p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="bg-slate-700/50 p-4 text-center border-t border-slate-700">
              <p className="text-xs text-slate-400 italic">
                *Sistem ini telah menghasilkan esai dengan instruksi "High Originality". Namun, pengecekan akhir tetap disarankan sebelum submit tugas.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center text-xs text-slate-500 italic pb-8">
        *Disclaimer: Konten ini dihasilkan oleh AI (Gemini Pro). Selalu verifikasi referensi sebelum submit tugas.
      </div>
    </div>
  );
};