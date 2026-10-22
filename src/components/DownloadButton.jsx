import { useState } from 'react';
import { Download, AlertCircle } from 'lucide-react';
import { generateAndDownloadDocx } from '../utils/generateDocx.js';
import { isFormValid } from '../utils/validateForm.js';

/**
 * Download DOCX button with loading state, error handling, and validation guard.
 */
export default function DownloadButton({ formData, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState('');

  const valid = isFormValid(formData);

  async function handleDownload() {
    if (!valid || loading) return;

    setLoading(true);
    setGenError('');

    try {
      await generateAndDownloadDocx(formData);
      onSuccess?.();
    } catch (err) {
      console.error('DOCX generation failed:', err);
      const msg = err?.message || 'Failed to generate document. Please try again.';
      setGenError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="download-section">
      <button
        id="btn-download-docx"
        className="download-btn-main"
        onClick={handleDownload}
        disabled={!valid || loading}
        aria-busy={loading}
        aria-label="Download cover page as Word document"
        title={!valid ? 'Please fill in all required fields first' : 'Download editable Word (.docx) file'}
      >
        {loading ? (
          <>
            <div className="download-btn-spinner" aria-hidden="true" />
            Generating Document...
          </>
        ) : (
          <>
            <Download size={18} />
            Download DOCX
          </>
        )}
      </button>

      {!valid && (
        <div className="download-hint" style={{ color: 'var(--color-error)', marginTop: '0.5rem' }}>
          <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Fill in all required fields to enable download.
        </div>
      )}

      {valid && !loading && (
        <div className="download-hint">
          Generates a real, editable .docx file compatible with Microsoft Word & LibreOffice.
        </div>
      )}

      {genError && (
        <div
          className="field-error"
          role="alert"
          style={{ justifyContent: 'center', marginTop: '0.5rem' }}
        >
          <AlertCircle size={13} />
          {genError}
        </div>
      )}
    </div>
  );
}
