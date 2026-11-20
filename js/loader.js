import * as pdfjsLib from
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/build/pdf.mjs';

// Point to the local file in your project directory (same domain = 'self')
pdfjsLib.GlobalWorkerOptions.workerSrc =
    './pdf.worker.mjs';

window.pdfjsLib = pdfjsLib;