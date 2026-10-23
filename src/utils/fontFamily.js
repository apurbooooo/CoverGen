const SUPPORTED_FONT_EXTENSIONS = new Set(['.woff2', '.woff', '.ttf', '.otf']);
const MAX_FONT_FILE_SIZE = 20 * 1024 * 1024;

export function getImportedFontFamily(fileName) {
  return String(fileName || 'Custom Font')
    .replace(/\.[^.]+$/, '')
    .replace(/[<>:"\/\\|?*\x00-\x1f]/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Custom Font';
}

export function validateFontFile(file) {
  const extension = file?.name?.slice(file.name.lastIndexOf('.')).toLowerCase();

  if (!file || !SUPPORTED_FONT_EXTENSIONS.has(extension)) {
    return 'Choose a WOFF2, WOFF, TTF, or OTF font file.';
  }

  if (file.size > MAX_FONT_FILE_SIZE) {
    return 'Font files must be 20 MB or smaller.';
  }

  return '';
}

export function getCssFontFamily(fontFamily, fallback = 'serif') {
  const safeFontFamily = String(fontFamily || 'Times New Roman')
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"');

  return `"${safeFontFamily}", ${fallback}`;
}
