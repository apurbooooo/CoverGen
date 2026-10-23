import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { FileText, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import ClassicAcademic from '../templates/ClassicAcademic.jsx';
import ModernMinimal from '../templates/ModernMinimal.jsx';
import FormalUniversity from '../templates/FormalUniversity.jsx';
import ElegantProfessional from '../templates/ElegantProfessional.jsx';
import { getFontScaleStyles } from '../utils/fontSizes.js';

const templateMap = {
  classic: ClassicAcademic,
  modern: ModernMinimal,
  formal: FormalUniversity,
  elegant: ElegantProfessional,
};

const ZOOM_LEVELS = [25, 30, 35, 40, 45, 50, 60, 75, 90, 100, 110];

/**
 * Live A4 cover page preview panel with zoom controls.
 */
export default function CoverPreview({ formData, hasContent }) {
  const [zoomIndex, setZoomIndex] = useState(6); // default = 60%
  const scrollRef = useRef(null);
  const autoFitRef = useRef(false);

  const TemplateComponent = templateMap[formData.template] || ClassicAcademic;
  const zoomValue = ZOOM_LEVELS[zoomIndex];

  const zoomIn = useCallback(() => {
    autoFitRef.current = false;
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  }, []);
  const zoomOut = useCallback(() => {
    autoFitRef.current = false;
    setZoomIndex((i) => Math.max(i - 1, 0));
  }, []);
  const fitToScreen = useCallback(() => {
    if (!scrollRef.current) return;
    autoFitRef.current = true;
    const scrollArea = scrollRef.current;
    const styles = window.getComputedStyle(scrollArea);
    const containerWidth = scrollArea.clientWidth -
      Number.parseFloat(styles.paddingLeft) -
      Number.parseFloat(styles.paddingRight);
    const pageWidth = 794;
    const fitZoom = Math.floor((containerWidth / pageWidth) * 100);
    const fittingZoom = ZOOM_LEVELS.reduce(
      (largestFit, level) => level <= fitZoom && level > largestFit ? level : largestFit,
      ZOOM_LEVELS[0]
    );
    setZoomIndex(ZOOM_LEVELS.indexOf(fittingZoom));
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(max-width: 600px)').matches) fitToScreen();
  }, [fitToScreen]);

  useEffect(() => {
    const handleResize = () => {
      if (autoFitRef.current) fitToScreen();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToScreen]);

  return (
    <div className="preview-outer">
      {/* Zoom toolbar inside preview */}
      <div className="preview-toolbar">
        <div className="preview-toolbar-label">
          <span className="preview-live-dot" aria-hidden="true" />
          <span>Live preview</span>
          <span className="preview-page-type">A4 · Portrait</span>
        </div>
        <div className="zoom-control" aria-label="Preview zoom controls">
          <button
            className="zoom-btn"
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="zoom-label" aria-live="polite">{zoomValue}%</span>
          <button
            className="zoom-btn"
            onClick={zoomIn}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
          <button
            className="zoom-btn"
            onClick={fitToScreen}
            aria-label="Fit to screen"
            title="Fit to screen"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Scroll area */}
      <div
        className={`preview-scroll-area${hasContent ? '' : ' preview-scroll-area--empty'}`}
        ref={scrollRef}
      >
        {hasContent ? (
          <div
            className="a4-frame"
            style={{
              width: `${794 * zoomValue / 100}px`,
              height: `${1123 * zoomValue / 100}px`,
            }}
          >
            <div
              className="a4-page"
              style={{
                transform: `scale(${zoomValue / 100})`,
                ...getFontScaleStyles(formData.fontSizes),
              }}
            >
              <TemplateComponent formData={formData} />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="preview-empty">
            <div className="preview-empty-icon">
              <FileText size={40} />
            </div>
            <h3>Preview will appear here</h3>
            <p>
              Fill in the university name, assignment title, and student information to see your cover page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
