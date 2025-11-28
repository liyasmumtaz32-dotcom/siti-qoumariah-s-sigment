import { GeneratedContent, Reference } from "../types";

export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const generateRisFile = (references: Reference[]): Blob => {
  let risContent = '';
  
  references.forEach((ref) => {
    risContent += `TY  - ${ref.type}\n`;
    risContent += `AU  - ${ref.author}\n`;
    risContent += `PY  - ${ref.year}\n`;
    risContent += `TI  - ${ref.title}\n`;
    
    if (ref.type === 'JOUR') {
        risContent += `T2  - ${ref.publication}\n`; // Journal Name
    } else {
        risContent += `PB  - ${ref.publication}\n`; // Publisher
    }
    
    if (ref.volume) risContent += `VL  - ${ref.volume}\n`;
    if (ref.issue) risContent += `IS  - ${ref.issue}\n`;
    if (ref.pages) risContent += `SP  - ${ref.pages}\n`;
    if (ref.doi) risContent += `DO  - ${ref.doi}\n`;
    if (ref.url) risContent += `UR  - ${ref.url}\n`;
    
    risContent += `ER  - \n\n`;
  });

  return new Blob([risContent], { type: 'application/x-research-info-systems' });
};

export const generateWordDoc = (content: GeneratedContent): Blob => {
  const styles = `
    <style>
      body { font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 12pt; }
      h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 24px; }
      h2 { font-size: 14pt; font-weight: bold; margin-top: 18px; margin-bottom: 12px; }
      p { margin-bottom: 12px; text-align: justify; }
      .reference-list { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
      .ref-item { margin-bottom: 10px; padding-left: 20px; text-indent: -20px; }
    </style>
  `;

  const bodyContent = content.bodyParagraphs.map(p => `
    <h2>${p.heading}</h2>
    <p>${p.content}</p>
  `).join('');

  const refContent = content.references.map(ref => `
    <div class="ref-item">
      ${ref.author} (${ref.year}). <i>${ref.title}</i>. ${ref.publication}. ${ref.doi ? `DOI: ${ref.doi}` : ''}
    </div>
  `).join('');

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${content.essayTitle}</title>
        ${styles}
      </head>
      <body>
        <h1>${content.essayTitle}</h1>
        
        <h2>Pendahuluan</h2>
        <p>${content.introduction}</p>
        
        ${bodyContent}
        
        <h2>Kesimpulan</h2>
        <p>${content.conclusion}</p>
        
        <div class="reference-list">
          <h2>Daftar Pustaka</h2>
          ${refContent}
        </div>
      </body>
    </html>
  `;

  return new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
};