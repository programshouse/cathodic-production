let _h2cLoading = null;

export async function loadHtml2CanvasOnce() {
  if (typeof window === "undefined") return;
  if (window.html2canvas) return;
  if (_h2cLoading) return _h2cLoading;
  _h2cLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load html2canvas"));
    document.head.appendChild(s);
  });
  return _h2cLoading;
}

/** Returns dataURL (PNG) of a node; returns null if node missing */
export async function captureNodeToPng(node, options = {}) {
  if (typeof window === "undefined" || !node) return null;
  await loadHtml2CanvasOnce();
  if (!window.html2canvas) return null;

  const {
    backgroundColor = "#ffffff",
    scale = 2,                 // crisp
    useCORS = true,            // allow external icons/fonts
    logging = false,
  } = options;

  const canvas = await window.html2canvas(node, { backgroundColor, scale, useCORS, logging });
  return canvas.toDataURL("image/png");
}
