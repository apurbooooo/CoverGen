/**
 * DOCX generation utility using the `docx` npm package.
 *
 * Generates a real, editable Office Open XML Word document with:
 * - A4 portrait dimensions and proper margins
 * - Embedded university logo image (when provided)
 * - All form data: university, assignment, students, instructor, dates
 * - Template-specific layout (Classic, Modern, Formal, Elegant)
 * - Theme color and font family applied throughout
 * - Omitted optional fields when empty
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  PageOrientation,
  convertInchesToTwip,
  VerticalAlign,
  TableLayoutType,
} from 'docx';
import { saveAs } from 'file-saver';
import { buildDocxFilename } from './sanitizeFilename.js';
import { fileToArrayBuffer, getLogoDocxDimensions } from './imageUtils.js';
import { getScaledDocxFontSize } from './fontSizes.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert hex color (#rrggbb) to docx hex (without #) */
function hexToDocx(hex) {
  return hex.replace('#', '').toUpperCase();
}

/** Format date string to human-readable format (e.g. "October 19, 2026") */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Create an empty spacer paragraph */
function spacer(size = 200) {
  return new Paragraph({ spacing: { before: 0, after: size } });
}

/** Create a horizontal rule paragraph */
function hrLine(color = '2563EB') {
  return new Paragraph({
    border: {
      bottom: { color, space: 1, value: BorderStyle.SINGLE, size: 12 },
    },
    spacing: { before: 100, after: 100 },
  });
}


/** Create a centered text paragraph */
function centeredText(text, { font, size = 24, bold = false, color = '1A1A2E', spacing = { before: 80, after: 80 }, italic = false } = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing,
    children: [
      new TextRun({ text, font, size, bold, color, italic }),
    ],
  });
}

/** Create a left-aligned text paragraph */
function leftText(text, { font, size = 22, bold = false, color = '2D3748', spacing = { before: 60, after: 60 } } = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing,
    children: [
      new TextRun({ text, font, size, bold, color }),
    ],
  });
}

function courseRuns(formData, font, color, separator, baseSize) {
  const runs = [];
  if (formData.courseName) {
    runs.push(new TextRun({
      text: formData.courseName,
      font,
      size: getScaledDocxFontSize(formData.fontSizes, 'courseName', baseSize),
      color,
    }));
  }
  if (formData.courseCode) {
    runs.push(new TextRun({
      text: `${formData.courseName ? separator : ''}${formData.courseCode}`,
      font,
      size: getScaledDocxFontSize(formData.fontSizes, 'courseCode', baseSize),
      color,
    }));
  }
  return runs;
}

/**
 * Build an ImageRun from raw ArrayBuffer data.
 * docx v9 requires transformation object for sizing.
 */
async function buildLogoImageRun(formData) {
  if (!formData.universityLogo) return null;
  try {
    const buffer = await fileToArrayBuffer(formData.universityLogo);
    const dims = getLogoDocxDimensions(formData.logoSize);
    const imageSize = await getImageFileDimensions(formData.universityLogo);
    const maxWidth = dims.width / 9144;
    const maxHeight = dims.height / 9144;
    const aspectRatio = imageSize?.width && imageSize?.height
      ? imageSize.width / imageSize.height
      : 1;
    const width = aspectRatio >= maxWidth / maxHeight ? maxWidth : maxHeight * aspectRatio;
    const height = aspectRatio >= maxWidth / maxHeight ? maxWidth / aspectRatio : maxHeight;
    const ext = formData.universityLogo.type.includes('png') ? 'png'
      : formData.universityLogo.type.includes('webp') ? 'png' // docx doesn't support webp, fallback
      : 'jpg';

    return new ImageRun({
      data: buffer,
      transformation: {
        width: Math.round(width),
        height: Math.round(height),
      },
      type: ext,
    });
  } catch {
    return null;
  }
}

function getImageFileDimensions(file) {
  return new Promise((resolve) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(previewUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      resolve(null);
    };
    image.src = previewUrl;
  });
}

// ─── Template Generators ────────────────────────────────────────────────────

/**
 * CLASSIC ACADEMIC — Traditional centered layout with horizontal rules.
 */
async function buildClassicTemplate(formData, font, themeColor) {
  const scaledSize = (key, size) => getScaledDocxFontSize(formData.fontSizes, key, size);
  const tc = hexToDocx(themeColor);
  const textColor = hexToDocx(formData.textColor || '#1A202C');
  const logoRun = await buildLogoImageRun(formData);
  const children = [];

  // Logo
  if (logoRun) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 160 }, children: [logoRun] }));
  } else {
    children.push(spacer(400));
  }

  // University Name
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 60 },
    children: [new TextRun({ text: formData.universityName, font, size: scaledSize('universityName', 34), bold: true, color: tc })],
  }));

  // Department
  if (formData.department) {
    children.push(centeredText(`Department of ${formData.department}`, { font, size: scaledSize('department', 24), color: textColor }));
  }

  // Session
  if (formData.session) {
    children.push(centeredText(formData.session, { font, size: scaledSize('session', 20), color: textColor, italic: true }));
  }

  children.push(spacer(200));
  children.push(hrLine(tc));
  children.push(spacer(200));

  // Assignment Type
  if (formData.assignmentType) {
    children.push(centeredText(formData.assignmentType.toUpperCase(), { font, size: scaledSize('assignmentType', 22), bold: true, color: tc, spacing: { before: 60, after: 120 } }));
  }

  // Assignment Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 160 },
    children: [new TextRun({ text: formData.assignmentTitle, font, size: scaledSize('assignmentTitle', 40), bold: true, color: textColor })],
  }));

  // Course
  if (formData.courseName || formData.courseCode) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      children: courseRuns(formData, font, textColor, ' | ', 24),
    }));
  }

  // Semester
  if (formData.semester) {
    children.push(centeredText(formData.semester, { font, size: scaledSize('semester', 20), color: textColor }));
  }

  children.push(spacer(200));
  children.push(hrLine(tc));
  children.push(spacer(200));

  // Submitted By / To — side by side using table
  const leftCells = [];
  const rightCells = [];

  // Submitted By header
  leftCells.push(new Paragraph({
    children: [new TextRun({ text: 'Submitted By', font, size: scaledSize('submittedByHeading', 26), bold: true, color: tc })],
    spacing: { before: 0, after: 120 },
  }));
  formData.students.forEach((s) => {
    if (!s.name) return;
    leftCells.push(leftText(s.name, { font, size: getScaledDocxFontSize(s.fontSizes, 'name', 24), bold: true, color: textColor }));
    if (s.studentId) leftCells.push(leftText(`ID: ${s.studentId}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'studentId', 20), color: textColor }));
    if (s.sessionYear) leftCells.push(leftText(`Session: ${s.sessionYear}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'sessionYear', 20), color: textColor }));
    if (s.department) leftCells.push(leftText(s.department, { font, size: getScaledDocxFontSize(s.fontSizes, 'department', 20), color: textColor }));
    leftCells.push(spacer(60));
  });

  // Submitted To header
  rightCells.push(new Paragraph({
    children: [new TextRun({ text: 'Submitted To', font, size: scaledSize('submittedToHeading', 26), bold: true, color: tc })],
    spacing: { before: 0, after: 120 },
  }));
  rightCells.push(leftText(formData.teacherName, { font, size: scaledSize('teacherName', 24), bold: true, color: textColor }));
  if (formData.teacherDesignation) rightCells.push(leftText(formData.teacherDesignation, { font, size: scaledSize('teacherDesignation', 20), color: textColor }));
  if (formData.teacherDepartment) rightCells.push(leftText(`Dept. of ${formData.teacherDepartment}`, { font, size: scaledSize('teacherDepartment', 20), color: textColor }));

  const twoColTable = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: leftCells, verticalAlign: VerticalAlign.TOP }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: rightCells, verticalAlign: VerticalAlign.TOP }),
        ],
      }),
    ],
  });
  children.push(twoColTable);

  children.push(spacer(200));
  children.push(hrLine(tc));
  children.push(spacer(100));

  // Date
  children.push(centeredText(`Date of Submission: ${formatDate(formData.submissionDate)}`, { font, size: scaledSize('submissionDate', 20), color: textColor }));

  // Additional Note
  if (formData.additionalNote) {
    children.push(spacer(100));
    children.push(centeredText(formData.additionalNote, { font, size: scaledSize('additionalNote', 18), color: textColor, italic: true }));
  }

  return children;
}

/**
 * MODERN MINIMAL — Left-aligned with colored accent sidebar via table.
 */
async function buildModernTemplate(formData, font, themeColor) {
  const scaledSize = (key, size) => getScaledDocxFontSize(formData.fontSizes, key, size);
  const tc = hexToDocx(themeColor);
  const textColor = hexToDocx(formData.textColor || '#1A202C');
  const logoRun = await buildLogoImageRun(formData);
  const contentChildren = [];

  // Header area
  contentChildren.push(spacer(300));

  if (logoRun) {
    contentChildren.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 200 }, children: [logoRun] }));
  }

  contentChildren.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: formData.universityName, font, size: scaledSize('universityName', 30), bold: true, color: tc })],
  }));

  if (formData.department) {
    contentChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: `Department of ${formData.department}`, font, size: scaledSize('department', 20), color: textColor })],
    }));
  }
  if (formData.session) {
    contentChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({ text: formData.session, font, size: scaledSize('session', 18), color: textColor, italics: true })],
    }));
  }

  contentChildren.push(hrLine(tc));
  contentChildren.push(spacer(240));

  if (formData.assignmentType) {
    contentChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: formData.assignmentType, font, size: scaledSize('assignmentType', 20), bold: true, color: tc })],
    }));
  }

  contentChildren.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 160 },
    children: [new TextRun({ text: formData.assignmentTitle, font, size: scaledSize('assignmentTitle', 44), bold: true, color: textColor })],
  }));

  if (formData.courseName || formData.courseCode) {
    contentChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 60 },
      children: courseRuns(formData, font, textColor, ' · ', 22),
    }));
  }
  if (formData.semester) {
    contentChildren.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({ text: formData.semester, font, size: scaledSize('semester', 20), color: textColor })],
    }));
  }

  contentChildren.push(hrLine('CBD5E0'));
  contentChildren.push(spacer(200));

  // Students
  contentChildren.push(new Paragraph({ children: [new TextRun({ text: 'SUBMITTED BY', font, size: scaledSize('submittedByHeading', 18), bold: true, color: tc, allCaps: true })], spacing: { before: 0, after: 120 } }));
  formData.students.forEach((s) => {
    if (!s.name) return;
    contentChildren.push(leftText(s.name, { font, size: getScaledDocxFontSize(s.fontSizes, 'name', 24), bold: true, color: textColor, spacing: { before: 0, after: 40 } }));
    if (s.studentId) contentChildren.push(leftText(`ID: ${s.studentId}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'studentId', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    if (s.sessionYear) contentChildren.push(leftText(`Session: ${s.sessionYear}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'sessionYear', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    if (s.department) contentChildren.push(leftText(s.department, { font, size: getScaledDocxFontSize(s.fontSizes, 'department', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    contentChildren.push(spacer(80));
  });

  contentChildren.push(spacer(120));
  contentChildren.push(new Paragraph({ children: [new TextRun({ text: 'SUBMITTED TO', font, size: scaledSize('submittedToHeading', 18), bold: true, color: tc, allCaps: true })], spacing: { before: 0, after: 120 } }));
  contentChildren.push(leftText(formData.teacherName, { font, size: scaledSize('teacherName', 24), bold: true, color: textColor, spacing: { before: 0, after: 40 } }));
  if (formData.teacherDesignation) contentChildren.push(leftText(formData.teacherDesignation, { font, size: scaledSize('teacherDesignation', 20), color: textColor, spacing: { before: 0, after: 20 } }));
  if (formData.teacherDepartment) contentChildren.push(leftText(`Department of ${formData.teacherDepartment}`, { font, size: scaledSize('teacherDepartment', 20), color: textColor, spacing: { before: 0, after: 20 } }));

  contentChildren.push(spacer(200));
  contentChildren.push(new Paragraph({ children: [new TextRun({ text: formatDate(formData.submissionDate), font, size: scaledSize('submissionDate', 20), color: textColor })] }));

  if (formData.additionalNote) {
    contentChildren.push(spacer(100));
    contentChildren.push(leftText(formData.additionalNote, { font, size: scaledSize('additionalNote', 18), color: textColor, spacing: { before: 0, after: 0 } }));
  }

  return contentChildren;
}

/**
 * FORMAL UNIVERSITY — Box-bordered institutional style.
 */
async function buildFormalTemplate(formData, font, themeColor) {
  const scaledSize = (key, size) => getScaledDocxFontSize(formData.fontSizes, key, size);
  const tc = hexToDocx(themeColor);
  const textColor = hexToDocx(formData.textColor || '#1A202C');
  const logoRun = await buildLogoImageRun(formData);
  const children = [];

  // Header box
  children.push(spacer(100));

  if (logoRun) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 160 }, children: [logoRun] }));
  } else {
    children.push(spacer(200));
  }

  // University in a shaded block
  const uniPara = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 160 },
    shading: { type: ShadingType.CLEAR, fill: tc },
    children: [new TextRun({ text: formData.universityName, font, size: scaledSize('universityName', 32), bold: true, color: 'FFFFFF' })],
  });
  children.push(uniPara);

  if (formData.department) {
    children.push(centeredText(`Department of ${formData.department}`, { font, size: scaledSize('department', 22), color: textColor, spacing: { before: 80, after: 40 } }));
  }
  if (formData.session) {
    children.push(centeredText(formData.session, { font, size: scaledSize('session', 18), color: textColor, italic: true, spacing: { before: 0, after: 160 } }));
  }

  children.push(spacer(160));

  // Bordered box for assignment info
  const assignBox = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 90, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.DOUBLE, size: 6, color: tc },
      bottom: { style: BorderStyle.DOUBLE, size: 6, color: tc },
      left: { style: BorderStyle.SINGLE, size: 4, color: tc },
      right: { style: BorderStyle.SINGLE, size: 4, color: tc },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { top: 200, bottom: 200, left: 300, right: 300 },
            children: [
              ...(formData.assignmentType ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formData.assignmentType, font, size: scaledSize('assignmentType', 22), bold: true, color: tc })], spacing: { before: 0, after: 120 } })] : []),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formData.assignmentTitle, font, size: scaledSize('assignmentTitle', 36), bold: true, color: textColor })], spacing: { before: 0, after: 120 } }),
              ...(formData.courseName || formData.courseCode ? [new Paragraph({ alignment: AlignmentType.CENTER, children: courseRuns(formData, font, textColor, ' | ', 22), spacing: { before: 0, after: 60 } })] : []),
              ...(formData.semester ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: formData.semester, font, size: scaledSize('semester', 20), color: textColor })], spacing: { before: 0, after: 0 } })] : []),
            ],
          }),
        ],
      }),
    ],
  });
  children.push(assignBox);
  children.push(spacer(240));

  // Two-column table for submitted by/to
  const leftCells = [
    new Paragraph({ children: [new TextRun({ text: 'Submitted By', font, size: scaledSize('submittedByHeading', 24), bold: true, color: tc })], spacing: { before: 0, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, color: tc, size: 4 } } }),
  ];
  formData.students.forEach((s) => {
    if (!s.name) return;
    leftCells.push(leftText(s.name, { font, size: getScaledDocxFontSize(s.fontSizes, 'name', 22), bold: true, color: textColor, spacing: { before: 80, after: 40 } }));
    if (s.studentId) leftCells.push(leftText(`ID: ${s.studentId}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'studentId', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    if (s.sessionYear) leftCells.push(leftText(`Session: ${s.sessionYear}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'sessionYear', 20), color: textColor, spacing: { before: 0, after: 20 } }));
  });

  const rightCells = [
    new Paragraph({ children: [new TextRun({ text: 'Submitted To', font, size: scaledSize('submittedToHeading', 24), bold: true, color: tc })], spacing: { before: 0, after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, color: tc, size: 4 } } }),
    leftText(formData.teacherName, { font, size: scaledSize('teacherName', 22), bold: true, color: textColor, spacing: { before: 80, after: 40 } }),
    ...(formData.teacherDesignation ? [leftText(formData.teacherDesignation, { font, size: scaledSize('teacherDesignation', 20), color: textColor, spacing: { before: 0, after: 20 } })] : []),
    ...(formData.teacherDepartment ? [leftText(`Dept. of ${formData.teacherDepartment}`, { font, size: scaledSize('teacherDepartment', 20), color: textColor, spacing: { before: 0, after: 20 } })] : []),
  ];

  children.push(new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: leftCells, verticalAlign: VerticalAlign.TOP }),
      new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: rightCells, verticalAlign: VerticalAlign.TOP }),
    ]})],
  }));

  children.push(spacer(200));
  children.push(hrLine(tc));
  children.push(centeredText(`Submission Date: ${formatDate(formData.submissionDate)}`, { font, size: scaledSize('submissionDate', 20), color: textColor }));

  if (formData.additionalNote) {
    children.push(spacer(80));
    children.push(centeredText(formData.additionalNote, { font, size: scaledSize('additionalNote', 18), color: textColor, italic: true }));
  }

  return children;
}

/**
 * ELEGANT PROFESSIONAL — Refined layout with header band.
 */
async function buildElegantTemplate(formData, font, themeColor) {
  const scaledSize = (key, size) => getScaledDocxFontSize(formData.fontSizes, key, size);
  const tc = hexToDocx(themeColor);
  const textColor = hexToDocx(formData.textColor || '#1A202C');
  const logoRun = await buildLogoImageRun(formData);
  const children = [];

  // Top decorative band
  children.push(new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: tc },
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: '  ', font, size: 48 })],
  }));
  children.push(spacer(200));

  // Logo
  if (logoRun) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 }, children: [logoRun] }));
  }

  // University
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: formData.universityName, font, size: scaledSize('universityName', 34), bold: true, color: tc })],
  }));

  if (formData.department) {
    children.push(centeredText(`Department of ${formData.department}`, { font, size: scaledSize('department', 22), color: textColor, spacing: { before: 0, after: 40 } }));
  }
  if (formData.session) {
    children.push(centeredText(formData.session, { font, size: scaledSize('session', 18), color: textColor, italic: true, spacing: { before: 0, after: 200 } }));
  }

  // Thin accent line
  children.push(new Paragraph({
    border: { bottom: { color: tc, space: 1, value: BorderStyle.SINGLE, size: 4 } },
    spacing: { before: 80, after: 320 },
  }));

  // Assignment block
  if (formData.assignmentType) {
    children.push(centeredText(formData.assignmentType, { font, size: scaledSize('assignmentType', 22), bold: true, color: tc, spacing: { before: 0, after: 80 } }));
  }

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    children: [new TextRun({ text: formData.assignmentTitle, font, size: scaledSize('assignmentTitle', 42), bold: true, color: textColor })],
  }));

  if (formData.courseName || formData.courseCode) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: courseRuns(formData, font, textColor, ' · ', 22),
    }));
  }
  if (formData.semester) {
    children.push(centeredText(formData.semester, { font, size: scaledSize('semester', 20), color: textColor, spacing: { before: 0, after: 200 } }));
  }

  // Second accent line
  children.push(new Paragraph({
    border: { bottom: { color: 'E2E8F0', space: 1, value: BorderStyle.SINGLE, size: 4 } },
    spacing: { before: 80, after: 280 },
  }));

  // Submitted by / to
  const leftParas = [
    new Paragraph({ children: [new TextRun({ text: 'Submitted By', font, size: scaledSize('submittedByHeading', 22), bold: true, color: tc })], spacing: { before: 0, after: 160 } }),
  ];
  formData.students.forEach((s) => {
    if (!s.name) return;
    leftParas.push(leftText(s.name, { font, size: getScaledDocxFontSize(s.fontSizes, 'name', 24), bold: true, color: textColor, spacing: { before: 0, after: 40 } }));
    if (s.studentId) leftParas.push(leftText(`ID: ${s.studentId}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'studentId', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    if (s.sessionYear) leftParas.push(leftText(`Session: ${s.sessionYear}`, { font, size: getScaledDocxFontSize(s.fontSizes, 'sessionYear', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    if (s.department) leftParas.push(leftText(s.department, { font, size: getScaledDocxFontSize(s.fontSizes, 'department', 20), color: textColor, spacing: { before: 0, after: 20 } }));
    leftParas.push(spacer(60));
  });

  const rightParas = [
    new Paragraph({ children: [new TextRun({ text: 'Submitted To', font, size: scaledSize('submittedToHeading', 22), bold: true, color: tc })], spacing: { before: 0, after: 160 } }),
    leftText(formData.teacherName, { font, size: scaledSize('teacherName', 24), bold: true, color: textColor, spacing: { before: 0, after: 40 } }),
    ...(formData.teacherDesignation ? [leftText(formData.teacherDesignation, { font, size: scaledSize('teacherDesignation', 20), color: textColor, spacing: { before: 0, after: 20 } })] : []),
    ...(formData.teacherDepartment ? [leftText(`Department of ${formData.teacherDepartment}`, { font, size: scaledSize('teacherDepartment', 20), color: textColor, spacing: { before: 0, after: 20 } })] : []),
  ];

  children.push(new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE } },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: leftParas, verticalAlign: VerticalAlign.TOP }),
      new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: rightParas, verticalAlign: VerticalAlign.TOP }),
    ]})],
  }));

  children.push(spacer(200));

  // Bottom band
  children.push(new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: tc },
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 0 },
    children: [new TextRun({ text: `  ${formatDate(formData.submissionDate)}  `, font, size: scaledSize('submissionDate', 22), color: 'FFFFFF', bold: true })],
  }));

  if (formData.additionalNote) {
    children.push(spacer(120));
    children.push(centeredText(formData.additionalNote, { font, size: scaledSize('additionalNote', 18), color: textColor, italic: true }));
  }

  return children;
}

// ─── Main Export ────────────────────────────────────────────────────────────

/**
 * Generates and downloads a DOCX file for the given form data.
 * @param {object} formData - The complete form state
 * @throws {Error} if generation fails
 */
export async function generateAndDownloadDocx(formData) {
  const font = formData.fontFamily || 'Times New Roman';
  const themeColor = formData.themeColor || '#1d4ed8';

  // Build content sections based on selected template
  let bodyChildren;
  switch (formData.template) {
    case 'modern':
      bodyChildren = await buildModernTemplate(formData, font, themeColor);
      break;
    case 'formal':
      bodyChildren = await buildFormalTemplate(formData, font, themeColor);
      break;
    case 'elegant':
      bodyChildren = await buildElegantTemplate(formData, font, themeColor);
      break;
    case 'classic':
    default:
      bodyChildren = await buildClassicTemplate(formData, font, themeColor);
      break;
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertInchesToTwip(8.27),   // A4 width
              height: convertInchesToTwip(11.69), // A4 height
            },
            margin: {
              top: convertInchesToTwip(1.0),
              bottom: convertInchesToTwip(1.0),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1.25),
            },
          },
        },
        children: bodyChildren.filter(Boolean), // Remove any nulls
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = buildDocxFilename(formData);
  saveAs(blob, filename);
}
