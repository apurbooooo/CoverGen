/**
 * Image utility functions for logo handling.
 * Handles validation, preview URL management, and converting images to
 * ArrayBuffer for embedding in DOCX documents.
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * Validates an uploaded image file.
 * Returns an error string if invalid, or null if valid.
 */
export function validateImageFile(file) {
  if (!file) return 'No file selected.';

  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload a PNG, JPEG, or WebP image.';
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds 5 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`;
  }

  return null; // valid
}

/**
 * Creates a temporary object URL for image preview.
 * The caller is responsible for calling revokeImageUrl() when done.
 */
export function createImagePreviewUrl(file) {
  return URL.createObjectURL(file);
}

/**
 * Revokes a temporary object URL to free memory.
 */
export function revokeImageUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Converts a File or Blob to an ArrayBuffer.
 * Used to embed images into DOCX documents via the docx package.
 */
export async function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converts a File to a base64 data URL string.
 */
export async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Returns a friendly display string for file size.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Maps logo size string to pixel dimensions for DOCX export.
 */
export function getLogoDocxDimensions(logoSize) {
  const sizes = {
    small: { width: 540000, height: 540000 },   // ~0.6 inch in EMU
    medium: { width: 810000, height: 810000 },  // ~0.9 inch in EMU
    large: { width: 1080000, height: 1080000 }, // ~1.2 inch in EMU
  };
  return sizes[logoSize] || sizes.medium;
}

/**
 * Maps logo size string to CSS pixel dimensions for preview.
 */
export function getLogoPreviewSize(logoSize) {
  const sizes = { small: 60, medium: 90, large: 120 };
  return sizes[logoSize] || 90;
}
