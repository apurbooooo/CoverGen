/**
 * Static option lists used across the form and selectors.
 */

export const assignmentTypeOptions = [
  { value: '', label: 'Select type...' },
  { value: 'Assignment', label: 'Assignment' },
  { value: 'Lab Report', label: 'Lab Report' },
  { value: 'Project Report', label: 'Project Report' },
  { value: 'Research Report', label: 'Research Report' },
  { value: 'Presentation Report', label: 'Presentation Report' },
  { value: 'Internship Report', label: 'Internship Report' },
  { value: 'Thesis / Dissertation', label: 'Thesis / Dissertation' },
  { value: 'Other', label: 'Other' },
];

export const fontFamilyOptions = [
  { value: 'Times New Roman', label: 'Times New Roman (Classic)' },
  { value: 'Arial', label: 'Arial (Clean)' },
  { value: 'Calibri', label: 'Calibri (Modern)' },
  { value: 'Georgia', label: 'Georgia (Elegant)' },
  { value: 'Garamond', label: 'Garamond (Scholarly)' },
  { value: 'Book Antiqua', label: 'Book Antiqua (Formal)' },
];

export const logoSizeOptions = [
  { value: 'small', label: 'Small', previewPx: 60, docxPx: 72 },
  { value: 'medium', label: 'Medium', previewPx: 90, docxPx: 108 },
  { value: 'large', label: 'Large', previewPx: 120, docxPx: 144 },
];

export const templateOptions = [
  {
    id: 'classic',
    name: 'Classic Academic',
    description: 'Traditional centered layout with divider lines',
    previewColor: '#1d4ed8',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean left-aligned with accent sidebar',
    previewColor: '#0891b2',
  },
  {
    id: 'formal',
    name: 'Formal University',
    description: 'Box-bordered institutional style',
    previewColor: '#7c3aed',
  },
  {
    id: 'elegant',
    name: 'Elegant Professional',
    description: 'Refined layout with decorative header band',
    previewColor: '#be123c',
  },
];

export const presetThemeColors = [
  { value: '#1d4ed8', label: 'Royal Blue' },
  { value: '#0891b2', label: 'Cyan Teal' },
  { value: '#7c3aed', label: 'Violet' },
  { value: '#be123c', label: 'Crimson' },
  { value: '#15803d', label: 'Forest Green' },
  { value: '#b45309', label: 'Amber Brown' },
  { value: '#1e293b', label: 'Slate Dark' },
  { value: '#c2410c', label: 'Burnt Orange' },
];
