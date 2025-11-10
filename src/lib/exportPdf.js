let _h2pdfLoading = null;

export async function loadHtml2PdfOnce() {
  if (typeof window === "undefined") return;
  if (window.html2pdf) return;
  if (_h2pdfLoading) return _h2pdfLoading;
  _h2pdfLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load html2pdf"));
    document.head.appendChild(s);
  });
  return _h2pdfLoading;
}

export async function exportHtmlToPdf(title, html, filename = "export.pdf") {
  if (typeof window === "undefined") return;
  await loadHtml2PdfOnce();
  const container = document.createElement("div");
  container.innerHTML = `
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#111827; }
      h1 { font-size:20px; margin:0 0 4px; }
      .sub{ color:#6B7280; font-size:12px; margin:0 0 12px; }
      pre{ white-space:pre-wrap; word-wrap:break-word; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:8px; padding:12px; font-size:12px; }
      section{ page-break-inside: avoid; margin: 0 0 24px; }
      img.screenshot { display:block; max-width:100%; height:auto; margin:8px 0; border:1px solid #e5e7eb; border-radius:8px; }
    </style>
    ${html}
  `;
  const opt = {
    margin:       0.5,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.92 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  await window.html2pdf().set(opt).from(container).save();
}
