import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowDown, X } from 'lucide-react';
import { initialFormData } from './data/initialFormData.js';
import { revokeImageUrl } from './utils/imageUtils.js';
import Header from './components/Header.jsx';
import CoverForm from './components/CoverForm.jsx';
import CoverPreview from './components/CoverPreview.jsx';
import DownloadButton from './components/DownloadButton.jsx';
import Footer from './components/Footer.jsx';
import { useToast } from './context/ToastContext.js';

const APPEARANCE_KEY = 'covercraft-appearance';

function getInitialAppearance() {
  try {
    const savedAppearance = window.localStorage.getItem(APPEARANCE_KEY);
    if (savedAppearance === 'light' || savedAppearance === 'dark') return savedAppearance;
  } catch {
    // Continue with the system preference when storage is unavailable.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [showErrors, setShowErrors] = useState(false);
  const [appearance, setAppearance] = useState(getInitialAppearance);
  const [customFontLoading, setCustomFontLoading] = useState(false);
  const [customFontLoadError, setCustomFontLoadError] = useState('');
  const [showMobilePreviewHint, setShowMobilePreviewHint] = useState(
    () => window.matchMedia('(max-width: 600px)').matches
  );
  const previewSectionRef = useRef(null);
  const formDataRef = useRef(formData);
  const { addToast } = useToast();

  useEffect(() => {
    if (!formData.customFontUrl) {
      setCustomFontLoading(false);
      setCustomFontLoadError('');
      return undefined;
    }

    if (!window.FontFace || !document.fonts) {
      setCustomFontLoading(false);
      setCustomFontLoadError('This browser cannot load imported fonts. Try a recent version of Chrome, Edge, or Firefox.');
      return undefined;
    }

    let active = true;
    let loadedFont;
    setCustomFontLoading(true);
    const fontFace = new FontFace(
      formData.customFontFamily || formData.fontFamily,
      `url(${JSON.stringify(formData.customFontUrl)})`
    );

    fontFace.load().then((font) => {
      if (!active) return;
      loadedFont = font;
      document.fonts.add(font);
      setCustomFontLoading(false);
      setCustomFontLoadError('');
    }).catch(() => {
      if (active) {
        setCustomFontLoading(false);
        setCustomFontLoadError('That font file could not be loaded. Please choose a valid font file.');
      }
    });

    return () => {
      active = false;
      if (loadedFont) document.fonts.delete(loadedFont);
    };
  }, [formData.customFontUrl]);

  useEffect(() => {
    const releaseImportedFont = () => revokeImageUrl(formDataRef.current.customFontUrl);
    window.addEventListener('pagehide', releaseImportedFont);
    return () => window.removeEventListener('pagehide', releaseImportedFont);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    document.documentElement.style.colorScheme = appearance;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    themeColorMeta?.setAttribute('content', appearance === 'dark' ? '#1A1816' : '#F7F6F3');
  }, [appearance]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 600px)');
    const handleViewportChange = (event) => setShowMobilePreviewHint(event.matches);
    mobileQuery.addEventListener('change', handleViewportChange);

    if (!window.IntersectionObserver || !previewSectionRef.current) {
      return () => mobileQuery.removeEventListener('change', handleViewportChange);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShowMobilePreviewHint(false);
    }, { threshold: 0.2 });
    observer.observe(previewSectionRef.current);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  const handleAppearanceToggle = useCallback(() => {
    setAppearance((current) => {
      const nextAppearance = current === 'dark' ? 'light' : 'dark';
      try {
        window.localStorage.setItem(APPEARANCE_KEY, nextAppearance);
      } catch {
        // The selected appearance still applies for this session.
      }
      return nextAppearance;
    });
  }, []);

  const handleChange = useCallback((updates) => {
    const previousFormData = formDataRef.current;
    const nextFormData = { ...previousFormData, ...updates };

    if (
      previousFormData.customFontUrl &&
      updates.customFontUrl !== undefined &&
      previousFormData.customFontUrl !== updates.customFontUrl
    ) {
      revokeImageUrl(previousFormData.customFontUrl);
    }

    formDataRef.current = nextFormData;
    setFormData(nextFormData);
  }, []);

  const handleReset = useCallback(() => {
    const hasInput = !!(
      formData.universityName ||
      formData.assignmentTitle ||
      formData.courseName ||
      formData.students[0]?.name
    );

    if (hasInput && !window.confirm('Reset all fields? Your changes will be lost.')) {
      return;
    }

    if (formData.universityLogoPreview) {
      revokeImageUrl(formData.universityLogoPreview);
    }
    revokeImageUrl(formData.customFontUrl);

    const resetFormData = {
      ...initialFormData,
      students: [
        {
          id: crypto.randomUUID(),
          name: '',
          studentId: '',
          sessionYear: '',
          department: '',
          fontSizes: { ...initialFormData.students[0].fontSizes },
        }
      ],
      submissionDate: new Date().toISOString().split('T')[0],
    };
    formDataRef.current = resetFormData;
    setFormData(resetFormData);
    setShowErrors(false);
    addToast({
      type: 'info',
      title: 'Form Reset',
      message: 'All fields have been cleared to default.',
    });
  }, [formData, addToast]);

  // Determine if there is enough content to show the live preview
  const hasContent = Boolean(
    formData.universityName.trim() ||
    formData.assignmentTitle.trim() ||
    formData.courseName.trim() ||
    formData.students[0]?.name.trim() ||
    formData.universityLogoPreview
  );

  return (
    <div className="app-shell">
      <Header
        onReset={handleReset}
        appearance={appearance}
        onToggleAppearance={handleAppearanceToggle}
      />

      <main className="app-main">
        <div className="workspace">
          <section className="workspace-form" aria-label="Form configuration panel">
            <CoverForm
              formData={formData}
              onChange={handleChange}
              showErrors={showErrors}
              customFontLoading={customFontLoading}
              customFontLoadError={customFontLoadError}
            />
          </section>

          <aside
            className="workspace-preview"
            aria-label="Cover page preview and export"
            ref={previewSectionRef}
          >
            <CoverPreview
              formData={formData}
              hasContent={hasContent}
            />

            <DownloadButton
              formData={formData}
              customFontLoading={customFontLoading}
              onSuccess={(format) => {
                addToast({
                  type: 'success',
                  title: format === 'pdf' ? 'PDF export ready' : 'Downloaded!',
                  message: format === 'pdf'
                    ? 'Choose “Save as PDF” in the print dialog to download your cover page.'
                    : 'Your cover page DOCX file has been generated successfully.',
                });
              }}
              onError={(msg) => {
                setShowErrors(true);
                addToast({
                  type: 'error',
                  title: 'Export Failed',
                  message: msg || 'Please fill in all required fields.',
                });
              }}
            />
          </aside>
        </div>
      </main>

      {showMobilePreviewHint && (
        <div className="mobile-preview-hint" role="status" aria-live="polite">
          <ArrowDown className="mobile-preview-hint-icon" size={16} aria-hidden="true" />
          <span>Scroll down to see the preview</span>
          <button
            className="mobile-preview-hint-dismiss"
            type="button"
            aria-label="Dismiss preview tip"
            onClick={() => setShowMobilePreviewHint(false)}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
