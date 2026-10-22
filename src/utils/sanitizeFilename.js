/**
 * Sanitizes a string to be safe as a filesystem filename.
 * Removes or replaces characters that are invalid in Windows/Linux filenames.
 */
export function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return 'Cover_Page';

  return name
    .trim()
    // oxlint-disable-next-line eslint(no-control-regex)
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_')                   // Replace spaces with underscores
    .replace(/_{2,}/g, '_')                 // Collapse multiple underscores
    .replace(/^_+|_+$/g, '')               // Trim leading/trailing underscores
    .substring(0, 100)                      // Limit length
    || 'Cover_Page';                        // Fallback if result is empty
}

/**
 * Builds a meaningful filename for the generated DOCX.
 * Example: "Digital_Logic_Design_Cover_Page.docx"
 */
export function buildDocxFilename(formData) {
  const parts = [];

  if (formData.courseName) {
    parts.push(sanitizeFilename(formData.courseName));
  } else if (formData.assignmentTitle) {
    parts.push(sanitizeFilename(formData.assignmentTitle));
  }

  parts.push('Cover_Page');

  return parts.join('_') + '.docx';
}
