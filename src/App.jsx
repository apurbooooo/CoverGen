import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowDown, X, Cloud } from 'lucide-react';
import { initialFormData } from './data/initialFormData.js';
import { revokeImageUrl } from './utils/imageUtils.js';
import { hasCoverContent } from './utils/coverContent.js';
import {
  clearAutoSaveDraft,
  readAutoSavePreference,
  restoreAutoSaveDraft,
  saveAutoSaveDraft,
  writeAutoSavePreference,
} from './utils/autoSave.js';
import Header from './components/Header.jsx';
import CoverForm from './components/CoverForm.jsx';
import CoverPreview from './components/CoverPreview.jsx';
import DownloadButton from './components/DownloadButton.jsx';
import Footer from './components/Footer.jsx';
import { useToast } from './context/ToastContext.js';

const APPEARANCE_KEY = 'covercraft-appearance';
const AUTO_SAVE_DELAY = 550;

function getInitialAppearance() {
  try {
    const savedAppearance = window.localStorage.getItem(APPEARANCE_KEY);
    if (savedAppearance === 'light' || savedAppearance === 'dark') return savedAppearance;
  } catch {
    // Continue with the system preference when storage is unavailable.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createEmptyFormData() {
  return {
    ...initialFormData,
    fontSizes: { ...initialFormData.fontSizes },
    students: [
      {
        id: crypto.randomUUID(),
        name: '',
        studentId: '',
        sessionYear: '',
        department: '',
        fontSizes: { ...initialFormData.students[0].fontSizes },
      },
    ],
    submissionDate: '',
    universityLogo: null,
    universityLogoPreview: '',
    customFontUrl: '',
    customFontName: '',
    customFontFamily: '',
  };
}

export default function App() {
  const [formData, setFormData] = useState(createEmptyFormData);
  const [autoSavePreference, setAutoSavePreference] = useState(readAutoSavePreference);
  const autoSaveEnabled = autoSavePreference.enabled;
  const [appearance, setAppearance] = useState(getInitialAppearance);
  const [customFontLoading, setCustomFontLoading] = useState(false);
  const [customFontLoadError, setCustomFontLoadError] = useState('');
  const [isHydrating, setIsHydrating] = useState(true);
  const [saveStatus, setSaveStatus] = useState(() => autoSavePreference.error ? 'error' : 'idle');
  const [saveStatusMessage, setSaveStatusMessage] = useState(
    () => autoSavePreference.error ? 'This browser could not read the Auto-save preference.' : ''
  );
  const [persistenceRevision, setPersistenceRevision] = useState(0);
  const [showMobilePreviewHint, setShowMobilePreviewHint] = useState(
    () => window.matchMedia('(max-width: 600px)').matches
  );
  const previewSectionRef = useRef(null);
  const formDataRef = useRef(formData);
  const autoSaveEnabledRef = useRef(autoSaveEnabled);
  const initialPreferenceErrorRef = useRef(autoSavePreference.error);
  const hasRestoredDraftRef = useRef(false);
  const persistenceRevisionRef = useRef(0);
  const savedAssetCacheRef = useRef({ logo: null, font: null });
  const saveQueueRef = useRef(Promise.resolve());
  const { addToast } = useToast();

  const enqueuePersistence = useCallback((operation) => {
    const queuedOperation = saveQueueRef.current
      .catch(() => undefined)
      .then(operation);
    saveQueueRef.current = queuedOperation;
    return queuedOperation;
  }, []);

  const bumpPersistenceRevision = useCallback(() => {
    const nextRevision = persistenceRevisionRef.current + 1;
    persistenceRevisionRef.current = nextRevision;
    setPersistenceRevision(nextRevision);
  }, []);

  useEffect(() => {
    let active = true;

    restoreAutoSaveDraft(createEmptyFormData()).then((result) => {
      if (!active) {
        revokeImageUrl(result.formData.universityLogoPreview);
        revokeImageUrl(result.formData.customFontUrl);
        return;
      }

      formDataRef.current = result.formData;
      savedAssetCacheRef.current = result.assetCache;
      hasRestoredDraftRef.current = result.hasSavedDraft;
      setFormData(result.formData);
      if (result.warning) {
        setSaveStatus('error');
        setSaveStatusMessage(result.warning);
      } else if (initialPreferenceErrorRef.current) {
        setSaveStatus('error');
        setSaveStatusMessage('This browser could not read the Auto-save preference.');
      } else if (autoSaveEnabledRef.current) {
        setSaveStatus(result.hasSavedDraft ? 'saved' : 'idle');
        setSaveStatusMessage('');
      } else {
        setSaveStatus('off');
        setSaveStatusMessage('');
      }
    }).catch((error) => {
      if (!active) return;
      setSaveStatus('error');
      setSaveStatusMessage(error?.message || 'The saved document could not be restored.');
    }).finally(() => {
      if (active) setIsHydrating(false);
    });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isHydrating || !autoSaveEnabled || persistenceRevision === 0) return undefined;

    let active = true;
    const revision = persistenceRevision;
    const timeout = window.setTimeout(() => {
      const snapshot = formDataRef.current;
      enqueuePersistence(async () => {
        if (!autoSaveEnabledRef.current || revision !== persistenceRevisionRef.current) return null;
        return saveAutoSaveDraft(snapshot, savedAssetCacheRef.current);
      }).then((assetCache) => {
        if (!assetCache) return;
        savedAssetCacheRef.current = assetCache;
        if (
          active &&
          autoSaveEnabledRef.current &&
          revision === persistenceRevisionRef.current
        ) {
          if (autoSavePreference.error) {
            setSaveStatus('error');
            setSaveStatusMessage('The document was saved, but the Auto-save preference could not be stored.');
          } else {
            setSaveStatus('saved');
            setSaveStatusMessage('');
          }
        }
      }).catch((error) => {
        if (
          active &&
          autoSaveEnabledRef.current &&
          revision === persistenceRevisionRef.current
        ) {
          setSaveStatus('error');
          setSaveStatusMessage(error?.message || 'Your browser could not save this document.');
        }
      });
    }, AUTO_SAVE_DELAY);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [autoSaveEnabled, autoSavePreference.error, enqueuePersistence, isHydrating, persistenceRevision]);

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
    bumpPersistenceRevision();
    setSaveStatus(autoSaveEnabledRef.current ? 'saving' : autoSavePreference.error ? 'error' : 'off');
    setSaveStatusMessage(autoSavePreference.error ? 'This browser could not store the Auto-save preference.' : '');
  }, [autoSavePreference.error, bumpPersistenceRevision]);

  const handleReset = useCallback(() => {
    const currentFormData = formDataRef.current;
    const hasInput = Boolean(
      hasRestoredDraftRef.current ||
      hasCoverContent(currentFormData) ||
      currentFormData.customFontUrl ||
      currentFormData.students.length > 1 ||
      currentFormData.template !== initialFormData.template ||
      currentFormData.themeColor !== initialFormData.themeColor ||
      currentFormData.textColor !== initialFormData.textColor ||
      currentFormData.fontFamily !== initialFormData.fontFamily ||
      currentFormData.logoSize !== initialFormData.logoSize ||
      JSON.stringify(currentFormData.fontSizes) !== JSON.stringify(initialFormData.fontSizes)
    );

    if (hasInput && !window.confirm('Reset all fields? Your changes will be lost.')) {
      return;
    }

    if (currentFormData.universityLogoPreview) {
      revokeImageUrl(currentFormData.universityLogoPreview);
    }
    revokeImageUrl(currentFormData.customFontUrl);

    const resetFormData = createEmptyFormData();
    formDataRef.current = resetFormData;
    setFormData(resetFormData);
    hasRestoredDraftRef.current = false;
    bumpPersistenceRevision();
    setSaveStatus(autoSaveEnabledRef.current ? 'saving' : autoSavePreference.error ? 'error' : 'off');
    setSaveStatusMessage(autoSavePreference.error ? 'This browser could not store the Auto-save preference.' : '');
    enqueuePersistence(async () => {
      await clearAutoSaveDraft();
      savedAssetCacheRef.current = { logo: null, font: null };
    }).catch((error) => {
      setSaveStatus('error');
      setSaveStatusMessage(error?.message || 'The saved document could not be cleared.');
    });
    addToast({
      type: 'info',
      title: 'Form Reset',
      message: 'All fields have been cleared to default.',
    });
  }, [addToast, autoSavePreference.error, bumpPersistenceRevision, enqueuePersistence]);

  const handleAutoSaveToggle = useCallback(() => {
    const nextEnabled = !autoSaveEnabledRef.current;
    autoSaveEnabledRef.current = nextEnabled;

    let preferenceError = '';
    try {
      writeAutoSavePreference(nextEnabled);
    } catch {
      preferenceError = 'This browser could not store the Auto-save preference.';
    }

    setAutoSavePreference({ enabled: nextEnabled, error: Boolean(preferenceError) });
    if (nextEnabled) {
      setSaveStatus('saving');
      setSaveStatusMessage(preferenceError);
      bumpPersistenceRevision();
    } else {
      setSaveStatus(preferenceError ? 'error' : 'off');
      setSaveStatusMessage(preferenceError);
    }
  }, [bumpPersistenceRevision]);

  // Show the selected template as soon as any cover content is provided.
  const hasContent = hasCoverContent(formData);

  if (isHydrating) {
    return (
      <div className="app-shell autosave-loading-shell">
        <div className="autosave-loading" role="status" aria-live="polite">
          <Cloud size={20} aria-hidden="true" />
          <span>Restoring your saved work…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header
        onReset={handleReset}
        appearance={appearance}
        onToggleAppearance={handleAppearanceToggle}
        downloadActions={(
          <DownloadButton
            compact
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
              addToast({
                type: 'error',
                title: 'Export Failed',
                message: msg || 'The document could not be generated. Please try again.',
              });
            }}
          />
        )}
      />

      <main className="app-main">
        <div className="workspace">
          <section className="workspace-form" aria-label="Form configuration panel">
            <CoverForm
              formData={formData}
              onChange={handleChange}
              customFontLoading={customFontLoading}
              customFontLoadError={customFontLoadError}
              autoSaveEnabled={autoSaveEnabled}
              onToggleAutoSave={handleAutoSaveToggle}
              saveStatus={saveStatus}
              saveStatusMessage={saveStatusMessage}
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
