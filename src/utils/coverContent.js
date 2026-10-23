function hasText(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

export function hasStudentDetails(student = {}) {
  return [student.name, student.studentId, student.sessionYear, student.department].some(hasText);
}

export function hasTeacherDetails(formData = {}) {
  return [formData.teacherName, formData.teacherDesignation, formData.teacherDepartment].some(hasText);
}

export function hasCoverContent(formData = {}) {
  const hasStudentInfo = Array.isArray(formData.students) && formData.students.some(hasStudentDetails);

  return Boolean(
    hasText(formData.universityName) ||
    formData.universityLogoPreview ||
    hasText(formData.department) ||
    hasText(formData.session) ||
    hasText(formData.assignmentType) ||
    hasText(formData.assignmentTitle) ||
    hasText(formData.courseName) ||
    hasText(formData.courseCode) ||
    hasText(formData.semester) ||
    hasStudentInfo ||
    hasTeacherDetails(formData) ||
    hasText(formData.submissionDate) ||
    hasText(formData.additionalNote)
  );
}
