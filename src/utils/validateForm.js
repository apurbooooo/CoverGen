/**
 * Form validation utility.
 * Returns an errors object with field paths as keys and error messages as values.
 * Empty object means no errors (form is valid).
 */

export function validateForm(formData) {
  const errors = {};

  // Required: University Name
  if (!formData.universityName.trim()) {
    errors.universityName = 'University name is required.';
  }

  // Required: Department
  if (!formData.department.trim()) {
    errors.department = 'Department is required.';
  }

  // Required: Assignment Title
  if (!formData.assignmentTitle.trim()) {
    errors.assignmentTitle = 'Assignment title is required.';
  }

  // Required: Course Name
  if (!formData.courseName.trim()) {
    errors.courseName = 'Course name is required.';
  }

  // Required: At least one student with a name
  const firstStudent = formData.students[0];
  if (!firstStudent || !firstStudent.name.trim()) {
    errors['students.0.name'] = 'At least one student name is required.';
  }

  // Validate all student entries that have any content
  formData.students.forEach((student, idx) => {
    if (student.name.trim() === '' && idx > 0) {
      // Extra students with no name should be flagged
      errors[`students.${idx}.name`] = 'Student name cannot be empty.';
    }
  });

  // Required: Teacher Name
  if (!formData.teacherName.trim()) {
    errors.teacherName = "Instructor's name is required.";
  }

  // Required: Submission Date
  if (!formData.submissionDate) {
    errors.submissionDate = 'Submission date is required.';
  }

  return errors;
}

/**
 * Returns true if the form has no validation errors.
 */
export function isFormValid(formData) {
  return Object.keys(validateForm(formData)).length === 0;
}
