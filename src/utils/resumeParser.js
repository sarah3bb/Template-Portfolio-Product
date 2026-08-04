import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as mammoth from 'mammoth/mammoth.browser';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx']);

function extensionOf(name = '') {
  return name.split('.').pop()?.toLowerCase() || '';
}

export function validateResumeFile(file) {
  if (!file) throw new Error('Choose a PDF or DOCX resume.');
  if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
    throw new Error('Unsupported file type. Choose a PDF or DOCX file.');
  }
  if (file.size > MAX_FILE_BYTES) throw new Error('Resume files must be 10 MB or smaller.');
}

// PDF text items include page coordinates. Grouping by Y and then sorting by X
// preserves rows in tables and avoids the most common multi-column scrambling.
async function parsePdf(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = [];

    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      let row = rows.find(candidate => Math.abs(candidate.y - y) < 2.5);
      if (!row) {
        row = { y, items: [] };
        rows.push(row);
      }
      row.items.push({ x, text: item.str.trim() });
    }

    rows.sort((a, b) => b.y - a.y);
    pages.push(rows.map(row => row.items.sort((a, b) => a.x - b.x).map(item => item.text).join('  ')).join('\n'));
  }

  return pages.join('\n\n--- PAGE BREAK ---\n\n');
}

async function parseDocx(arrayBuffer) {
  // Raw text retains table cell order and list text without injecting HTML.
  const { value, messages } = await mammoth.extractRawText({ arrayBuffer });
  if (!value.trim()) {
    const detail = messages[0]?.message ? ` (${messages[0].message})` : '';
    throw new Error(`No readable text was found in this DOCX file${detail}.`);
  }
  return value;
}

export async function parseResumeFile(file) {
  validateResumeFile(file);
  const buffer = await file.arrayBuffer();
  const text = extensionOf(file.name) === 'pdf' ? await parsePdf(buffer) : await parseDocx(buffer);
  const normalized = text.split('\0').join('').replace(/[ \t]+\n/g, '\n').trim();
  if (normalized.length < 20) throw new Error('No readable resume text was found. Scanned image-only PDFs are not supported yet.');
  return normalized;
}
