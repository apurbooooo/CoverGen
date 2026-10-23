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
  const [showMobilePreviewHint, setShowMobilePreviewHint] = useState(
    () => window.matchMedia('(max-width: 600px)').matches
  );
  const previewSectionRef = useRef(null);
  const { addToast } = useToast();

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
    setFormData((prev) => ({ ...prev, ...updates }));
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

    setFormData({
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
    });
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
              onSuccess={() => {
                addToast({
                  type: 'success',
                  title: 'Downloaded!',
                  message: 'Your cover page DOCX file has been generated successfully.',
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
