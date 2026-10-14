import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export const uid = () => Math.random().toString(36).slice(2, 10);

const isPdf = (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

/** Convert every page of a PDF into a JPEG image (so we can draw on it). */
async function pdfToPages(file, scale = 1.6) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    pages.push({ src: canvas.toDataURL('image/jpeg', 0.85), width: viewport.width, height: viewport.height });
  }
  return pages;
}

function imageToPage(file) {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error(`Cannot read image: ${file.name}`));
    img.src = src;
  });
}

/** One uploaded file = one answer copy. PDF pages / image become "pages". */
export async function fileToCopy(file) {
  const pages = isPdf(file) ? await pdfToPages(file) : [await imageToPage(file)];
  const barcode = file.name.replace(/\.[^.]+$/, ''); // file name = barcode for now
  return { id: uid(), name: file.name, barcode, pages };
}

/** Question paper is shown as it is (PDF in browser viewer, or image). */
export function fileToPaper(file) {
  return { name: file.name, url: URL.createObjectURL(file), kind: isPdf(file) ? 'pdf' : 'image' };
}
