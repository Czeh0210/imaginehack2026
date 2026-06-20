import { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const COLORS = [
  {
    bg: "rgba(251, 146, 60, 0.40)",
    border: "#c97c3a",
    badge: "#c97c3a",
    label: "Improvement",
    activeBg: "#fef3e2",
  },
  {
    bg: "rgba(59, 130, 246, 0.35)",
    border: "#3b82f6",
    badge: "#3b82f6",
    label: "Suggestion",
    activeBg: "#e0effe",
  },
  {
    bg: "rgba(34, 197, 94, 0.35)",
    border: "#22c55e",
    badge: "#22c55e",
    label: "Enhancement",
    activeBg: "#dcfce7",
  },
];

export default function PdfAnalysisViewer({ pdfBase64, analysis }) {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(600);
  const [activeIdx, setActiveIdx] = useState(null);
  const [pagesRendered, setPagesRendered] = useState(0);

  const viewerRef = useRef(null);
  const panelRef = useRef(null);

  const pdfFile = `data:application/pdf;base64,${pdfBase64}`;

  const highlights = analysis.improvements.map((item, idx) => ({
    text: item.highlight || "",
    color: COLORS[idx % COLORS.length],
    idx,
    item,
  }));

  // ── Responsive width ──────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      if (viewerRef.current) {
        setPageWidth(Math.max(280, viewerRef.current.clientWidth - 32));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (viewerRef.current) ro.observe(viewerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── DOM-based highlight (works across span boundaries & weird formatting)
  const applyHighlights = useCallback(() => {
    if (!viewerRef.current) return;

    const textLayers = viewerRef.current.querySelectorAll(
      ".react-pdf__Page__textContent"
    );

    textLayers.forEach((layer) => {
      // ① Reset previous highlights
      layer.querySelectorAll("span[data-hid]").forEach((span) => {
        span.removeAttribute("data-hid");
        span.style.background = "";
        span.style.outline = "";
        span.style.outlineOffset = "";
        span.style.borderRadius = "";
        span.style.cursor = "";
        span.onclick = null;
      });

      // ② Collect spans
      const spans = Array.from(layer.querySelectorAll("span"));
      if (!spans.length) return;

      // ③ Build a normalized string and a map back to the original spans.
      // We strip out everything except letters and numbers so that missing spaces,
      // hyphens at line breaks, and smart quotes don't break the search.
      let normalizedString = "";
      const charMap = []; // maps normalizedString index -> original span

      spans.forEach((span) => {
        const text = span.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          // Keep only alphanumeric characters for the search
          if (/[a-zA-Z0-9]/.test(char)) {
            normalizedString += char.toLowerCase();
            charMap.push(span);
          }
        }
      });

      if (!normalizedString) return;

      // ④ Search and highlight
      highlights.forEach(({ text, color, idx }) => {
        if (!text || text.length < 3) return;

        // Normalize the highlight string the exact same way
        const normalizedHighlight = text.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!normalizedHighlight) return;

        // Find ALL occurrences in this page
        let pos = normalizedString.indexOf(normalizedHighlight);
        while (pos !== -1) {
          const end = pos + normalizedHighlight.length;

          // Collect all spans that contain the characters of this match
          const matchedSpans = new Set();
          for (let i = pos; i < end; i++) {
            if (charMap[i]) matchedSpans.add(charMap[i]);
          }

          // Apply styles
          matchedSpans.forEach((span) => {
            span.style.background = color.bg;
            span.style.outline = `2px solid ${color.border}`;
            span.style.outlineOffset = "1px";
            span.style.borderRadius = "3px";
            span.style.cursor = "pointer";
            span.setAttribute("data-hid", idx);
            span.title = `#${idx + 1} ${color.label} — click for details`;

            span.onclick = (e) => {
              e.stopPropagation();
              setActiveIdx((prev) => (prev === idx ? null : idx));
              const card = document.getElementById(`pdf-imp-${idx}`);
              if (card && panelRef.current) {
                panelRef.current.scrollTo({
                  top: card.offsetTop - 16,
                  behavior: "smooth",
                });
              }
            };
          });

          // Look for next occurrence on the same page
          pos = normalizedString.indexOf(normalizedHighlight, pos + 1);
        }
      });
    });
  }, [highlights]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wait until ALL pages have rendered their canvas, then apply highlights.
  // Two attempts: 400ms (usually enough) + 700ms retry (for slow renders).
  useEffect(() => {
    if (!numPages || pagesRendered < numPages) return;

    const t1 = setTimeout(applyHighlights, 400);
    const t2 = setTimeout(applyHighlights, 900); // retry in case text layer was late
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [pagesRendered, numPages, applyHighlights]);

  const handlePageRenderSuccess = useCallback(() => {
    setPagesRendered((n) => n + 1);
  }, []);

  // ── Sidebar card interaction ──────────────────────────────────────────
  const toggleCard = (idx) => {
    setActiveIdx((prev) => (prev === idx ? null : idx));
    const card = document.getElementById(`pdf-imp-${idx}`);
    if (card && panelRef.current) {
      panelRef.current.scrollTo({
        top: card.offsetTop - 16,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="pav-root">
      {/* Summary bar */}
      <div className="pav-summary">
        <span className="pav-summary-icon">📊</span>
        <div>
          <p className="pav-summary-text">{analysis.summary}</p>
          <p className="pav-summary-hint">
            {analysis.improvements.length} area
            {analysis.improvements.length !== 1 ? "s" : ""} highlighted in the
            PDF · Click any highlight or card for details
          </p>
        </div>
      </div>

      {/* Legend row */}
      <div className="pav-legend">
        {highlights.map(({ color, idx, item }) => (
          <span
            key={idx}
            className="pav-legend-chip"
            style={{ borderColor: color.border, color: color.border }}
            onClick={() => toggleCard(idx)}
          >
            <span
              className="pav-legend-dot"
              style={{ background: color.border }}
            />
            #{idx + 1} {color.label}
          </span>
        ))}
      </div>

      {/* Split view */}
      <div className="pav-split">
        {/* ── PDF panel ── */}
        <div className="pav-pdf-panel" ref={viewerRef}>
          <Document
            file={pdfFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="pav-loading">
                <div className="pav-spinner" />
                <span>Loading PDF…</span>
              </div>
            }
            error={
              <div className="pav-error">
                ⚠ Could not render PDF. The file may be protected.
              </div>
            }
          >
            {Array.from({ length: numPages || 0 }, (_, i) => (
              <div key={i + 1} className="pav-page-wrapper">
                <p className="pav-page-label">Page {i + 1}</p>
                <Page
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  onRenderSuccess={handlePageRenderSuccess}
                />
              </div>
            ))}
          </Document>
        </div>

        {/* ── Improvements sidebar ── */}
        <div className="pav-imp-panel" ref={panelRef}>
          <p className="pav-panel-title">Improvements</p>

          {highlights.map(({ color, idx, item }) => {
            const isActive = activeIdx === idx;
            return (
              <div
                key={idx}
                id={`pdf-imp-${idx}`}
                className={`pav-card ${isActive ? "pav-card-active" : ""}`}
                style={{
                  borderLeft: `4px solid ${color.border}`,
                  background: isActive ? color.activeBg : "#ffffff",
                }}
                onClick={() => toggleCard(idx)}
              >
                {/* Header */}
                <div className="pav-card-header">
                  <span
                    className="pav-badge"
                    style={{ background: color.badge }}
                  >
                    #{idx + 1} {color.label}
                  </span>
                  <span className="pav-chevron">{isActive ? "▲" : "▼"}</span>
                </div>

                {/* Highlighted quote */}
                <blockquote
                  className="pav-quote"
                  style={{ borderColor: color.border, background: color.bg }}
                >
                  &ldquo;{item.highlight}&rdquo;
                </blockquote>

                {/* Expanded details */}
                {isActive && (
                  <div className="pav-details">
                    <div className="pav-section">
                      <span className="pav-section-label">⚠ Issue</span>
                      <p className="pav-section-text">{item.issue}</p>
                    </div>
                    <div className="pav-section">
                      <span className="pav-section-label">💡 Suggestion</span>
                      <p className="pav-section-text">{item.suggestion}</p>
                    </div>
                    {item.resources?.length > 0 && (
                      <div className="pav-section">
                        <span className="pav-section-label">📎 Resources</span>
                        <div className="pav-resources">
                          {item.resources.map((r, ri) => (
                            <a
                              key={ri}
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pav-resource-chip"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ↗ {r.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .pav-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          font-family: "Inter", sans-serif;
        }

        /* Summary */
        .pav-summary {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 16px;
          background: #f7f7f8;
          border: 1px solid #e5e5e8;
          border-radius: 12px;
        }
        .pav-summary-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .pav-summary-text {
          margin: 0 0 3px;
          font-size: 13.5px;
          line-height: 1.6;
          color: #333;
        }
        .pav-summary-hint {
          margin: 0;
          font-size: 11px;
          color: #999;
        }

        /* Legend */
        .pav-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .pav-legend-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border: 1.5px solid;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .pav-legend-chip:hover {
          opacity: 0.75;
        }
        .pav-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Split layout */
        .pav-split {
          display: flex;
          gap: 0;
          height: 72vh;
          min-height: 520px;
          border: 1px solid #e5e5e8;
          border-radius: 14px;
          overflow: hidden;
          background: #fafafa;
        }

        /* PDF panel */
        .pav-pdf-panel {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #525659;
          scrollbar-width: thin;
          scrollbar-color: #888 transparent;
        }
        .pav-pdf-panel::-webkit-scrollbar {
          width: 5px;
        }
        .pav-pdf-panel::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .pav-page-wrapper {
          margin-bottom: 20px;
        }
        .pav-page-label {
          text-align: center;
          font-size: 11px;
          color: #bbb;
          margin: 0 0 6px;
        }

        /* React-pdf page shadow */
        .pav-pdf-panel :global(.react-pdf__Page) {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          border-radius: 3px;
          overflow: visible;
        }

        /* Make highlighted spans stand out */
        .pav-pdf-panel :global(span[data-hid]) {
          transition: opacity 0.2s;
          mix-blend-mode: multiply;
        }
        .pav-pdf-panel :global(span[data-hid]:hover) {
          opacity: 0.75;
        }

        .pav-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 200px;
          color: #ccc;
          font-size: 13px;
        }
        .pav-error {
          padding: 24px;
          color: #f87171;
          font-size: 13px;
          text-align: center;
        }
        .pav-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #555;
          border-top-color: #bbb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Improvements sidebar */
        .pav-imp-panel {
          width: 300px;
          min-width: 260px;
          overflow-y: auto;
          padding: 14px 12px;
          background: #ffffff;
          border-left: 1px solid #e5e5e8;
          display: flex;
          flex-direction: column;
          gap: 8px;
          scrollbar-width: thin;
          scrollbar-color: #d8d8d8 transparent;
        }
        .pav-panel-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #aaa;
          margin: 0 0 4px;
        }

        /* Cards */
        .pav-card {
          border-radius: 10px;
          border: 1px solid #ebebed;
          padding: 11px 12px;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .pav-card:hover {
          border-color: #d0d0d4;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .pav-card-active {
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }
        .pav-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pav-badge {
          display: inline-block;
          padding: 2px 9px;
          border-radius: 20px;
          font-size: 10.5px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.02em;
        }
        .pav-chevron {
          font-size: 9px;
          color: #aaa;
        }
        .pav-quote {
          margin: 0;
          padding: 5px 9px;
          border-left: 3px solid;
          border-radius: 0 6px 6px 0;
          font-size: 11.5px;
          font-style: italic;
          color: #444;
          line-height: 1.5;
          word-break: break-word;
        }

        /* Expanded details */
        .pav-details {
          display: flex;
          flex-direction: column;
          gap: 9px;
          padding-top: 2px;
          animation: fadeSlide 0.2s ease;
        }
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pav-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pav-section-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #999;
        }
        .pav-section-text {
          margin: 0;
          font-size: 12px;
          line-height: 1.55;
          color: #333;
        }
        .pav-resources {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }
        .pav-resource-chip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 9px;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 20px;
          font-size: 11px;
          color: #4361c2;
          text-decoration: none;
          transition: all 0.15s;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pav-resource-chip:hover {
          background: #e0e7ff;
          border-color: #818cf8;
          color: #3730a3;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .pav-split {
            flex-direction: column;
            height: auto;
          }
          .pav-imp-panel {
            width: 100%;
            min-width: unset;
            border-left: none;
            border-top: 1px solid #e5e5e8;
            max-height: 380px;
          }
        }
      `}</style>
    </div>
  );
}
