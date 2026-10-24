import { DEFAULT_FONT_SIZES, DEFAULT_STUDENT_FONT_SIZES } from '../utils/fontSizes.js';

/**
 * Default form data structure used to initialize and reset the form.
 * All cover content fields are optional and default to empty string.
 */

export const initialFormData = {
  // Section 1: University Information
  universityName: '',
  universityLogo: null,       // File object or null
  universityLogoPreview: '',  // Object URL string for preview
  department: '',
  session: '',

  // Section 2: Assignment Information
  assignmentTitle: '',
  assignmentType: '',
  courseName: '',
  courseCode: '',
  semester: '',

  // Section 3: Submitted By (array of student entries)
  students: [
    {
      id: crypto.randomUUID(),
      name: '',
      studentId: '',
      classSection: '',
      sessionYear: '',
      department: '',
      fontSizes: { ...DEFAULT_STUDENT_FONT_SIZES },
    }
  ],

  // Section 4: Submitted To
  teacherName: '',
  teacherDesignation: '',
  teacherDepartment: '',

  // Section 5: Submission Details
  submissionDate: '',
  additionalNote: '',

  // Section 6: Design Customization
  themeColor: '#1d4ed8',
  textColor: '#1A202C',
  fontFamily: 'Times New Roman',
  fontSizes: { ...DEFAULT_FONT_SIZES },
  logoSize: 'medium',
  template: 'classic',
  textAlignment: 'center',
};
