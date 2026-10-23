import { useState } from 'react';
import { Download, AlertCircle, FileDown } from 'lucide-react';
import { generateAndDownloadDocx } from '../utils/generateDocx.js';
import { buildPdfFilename } from '../utils/sanitizeFilename.js';
import { isFormValid } from '../utils/validateForm.js';

/**
 * Document export buttons with loading state, error handling, and validation guard.
 */
export default function DownloadButton({ formData, customFontLoading = false, onSuccess, onError }) {
  const [loadingFormat, setLoadingFormat] = useState('');
  const [genError, setGenError] = useState('');

  const valid = isFormValid(formData);
  const loading = Boolean(loadingFormat);

  async function handleDownload() {
    if (!valid || loading) return;

    setLoadingFormat('docx');
    setGenError('');

    try {
      await generateAndDownloadDocx(formData);
      onSuccess?.('docx');
    } catch (err) {
      console.error('DOCX generation failed:', err);
      const msg = err?.message || 'Failed to generate document. Please try again.';
      setGenError(msg);
      onError?.(msg);
    } finally {
      setLoadingFormat('');
    }
  }

  function handlePdfDownload() {
    if (!valid || loading) return;

    setGenError('');
    const originalTitle = document.title;

    try {
      // The browser print dialog lets users save the A4 cover page as a PDF.
      document.title = buildPdfFilename(formData).replace(/\.pdf$/i, '');
      window.print();
      onSuccess?.('pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
      const msg = err?.message || 'Failed to open the PDF download dialog. Please try again.';
      setGenError(msg);
      onError?.(msg);
    } finally {
      document.title = originalTitle;
    }
  }

  return (
    <div className="download-section">
      <div className="download-actions">
        <button
          id="btn-download-docx"
          className="download-btn-main"
          onClick={handleDownload}
          disabled={!valid || loading}
          aria-busy={loadingFormat === 'docx'}
          aria-label="Download cover page as Word document"
          title={!valid ? 'Please fill in all required fields first' : 'Download editable Word (.docx) file'}
        >
          {loadingFormat === 'docx' ? (
            <>
              <div className="download-btn-spinner" aria-hidden="true" />
              Generating DOCX...
            </>
          ) : (
            <>
              <Download size={18} />
              Download DOCX
            </>
          )}
        </button>

        <button
          id="btn-download-pdf"
          className="download-btn-main download-btn-pdf"
          onClick={handlePdfDownload}
          disabled={!valid || loading || customFontLoading}
          aria-label="Download cover page as PDF"
          title={!valid
            ? 'Please fill in all required fields first'
            : customFontLoading
              ? 'Wait for the imported font to finish loading'
              : 'Open print dialog to save as PDF'}
        >
          <FileDown size={18} />
          Download PDF
        </button>
      </div>

      {!valid && (
        <div className="download-hint" style={{ color: 'var(--color-error)', marginTop: '0.5rem' }}>
          <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          Fill in all required fields to enable download.
        </div>
      )}

      {valid && !loading && (
        <div className="download-hint">
          DOCX is editable in Word and LibreOffice. For PDF, choose “Save as PDF” in the print dialog.
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
