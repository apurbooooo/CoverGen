import { useRef, useState } from 'react';
import { X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { validateImageFile, createImagePreviewUrl, revokeImageUrl, formatFileSize } from '../utils/imageUtils.js';

/**
 * Logo upload component with drag-and-drop, preview, size selector, and remove button.
 */
export default function LogoUploader({ formData, onChange }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  function handleFile(file) {
    const err = validateImageFile(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError('');

    // Revoke old preview URL to avoid memory leaks
    if (formData.universityLogoPreview) {
      revokeImageUrl(formData.universityLogoPreview);
    }

    const previewUrl = createImagePreviewUrl(file);
    onChange({ universityLogo: file, universityLogoPreview: previewUrl });
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    if (formData.universityLogoPreview) {
      revokeImageUrl(formData.universityLogoPreview);
    }
    onChange({ universityLogo: null, universityLogoPreview: '' });
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleLogoSize(size) {
    onChange({ logoSize: size });
  }

  const logoSizes = ['small', 'medium', 'large'];

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleInputChange}
        className="sr-only"
        id="logo-file-input"
        aria-label="Upload university logo"
      />

      {formData.universityLogoPreview ? (
        /* Logo preview */
        <div className="animate-scaleIn">
          <div className="logo-preview-container">
            <img
              src={formData.universityLogoPreview}
              alt="University logo preview"
              className="logo-preview-img"
              style={{ width: 56, height: 56 }}
            />
            <div className="logo-preview-info">
              <div className="logo-preview-name">{formData.universityLogo?.name || 'Logo'}</div>
              <div className="logo-preview-size">
                {formData.universityLogo ? formatFileSize(formData.universityLogo.size) : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <CheckCircle size={12} color="var(--color-success)" />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', fontWeight: 600 }}>Uploaded</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                title="Replace logo"
              >
                Replace
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleRemove}
                title="Remove logo"
                id="btn-remove-logo"
              >
                <X size={12} /> Remove
              </button>
            </div>
          </div>

          {/* Logo size selector */}
          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ marginBottom: '0.5rem' }}>Logo Size on Cover</label>
            <div className="logo-size-options">
              {logoSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`logo-size-btn ${formData.logoSize === size ? 'active' : ''}`}
                  onClick={() => handleLogoSize(size)}
                  aria-pressed={formData.logoSize === size}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Upload dropzone */
        <div
          className={`logo-upload-area ${isDragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Click or drag to upload university logo"
        >
          <div className="logo-upload-icon">
            <ImageIcon size={32} />
          </div>
          <div className="logo-upload-text">
            <strong>Click to upload</strong> or drag & drop
          </div>
          <div className="logo-upload-hint">PNG, JPEG, WebP · Max 5 MB</div>
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="field-error" role="alert" style={{ marginTop: '0.5rem' }}>
          {uploadError}
        </div>
      )}
    </div>
  );
}
