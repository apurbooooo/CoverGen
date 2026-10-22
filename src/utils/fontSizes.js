export const DEFAULT_FONT_SIZES = {
  universityName: 100,
  department: 100,
  session: 100,
  assignmentType: 100,
  assignmentTitle: 100,
  courseName: 100,
  courseCode: 100,
  semester: 100,
  submittedByHeading: 100,
  submittedToHeading: 100,
  teacherName: 100,
  teacherDesignation: 100,
  teacherDepartment: 100,
  submissionDate: 100,
  additionalNote: 100,
};

export const DEFAULT_STUDENT_FONT_SIZES = {
  name: 100,
  studentId: 100,
  sessionYear: 100,
  department: 100,
};

export function normalizeFontScale(value) {
  const scale = Number(value);
  if (!Number.isFinite(scale)) return 100;
  return Math.min(150, Math.max(70, scale));
}

export function getFontScaleStyles(fontSizes = {}) {
  return Object.fromEntries(
    Object.entries(fontSizes).map(([key, value]) => [
      `--font-scale-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      normalizeFontScale(value) / 100,
    ])
  );
}

export function getScaledDocxFontSize(fontSizes, key, baseSize) {
  return Math.round(baseSize * normalizeFontScale(fontSizes?.[key]) / 100);
}
