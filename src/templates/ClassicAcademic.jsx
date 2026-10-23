import { getLogoPreviewSize } from '../utils/imageUtils.js';
import { getFontScaleStyles } from '../utils/fontSizes.js';
import { getCssFontFamily } from '../utils/fontFamily.js';
import { hasStudentDetails, hasTeacherDetails } from '../utils/coverContent.js';

/**
 * Formats a date string as "Month DD, YYYY".
 */
function fmt(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}

/**
 * CLASSIC ACADEMIC template preview.
 * Traditional centered layout with horizontal divider rules.
 */
export default function ClassicAcademic({ formData }) {
  const { themeColor, fontFamily, universityLogoPreview, logoSize } = formData;
  const logoSizePx = getLogoPreviewSize(logoSize);
  const hasStudents = formData.students.some(hasStudentDetails);
  const hasTeacher = hasTeacherDetails(formData);

  return (
    <div
      className="tpl-page tpl-classic"
      style={{ fontFamily: getCssFontFamily(fontFamily, 'serif'), '--document-text-color': formData.textColor || '#1A202C' }}
    >
      {/* University Logo */}
      {universityLogoPreview && (
        <div className="uni-logo">
          <img
            src={universityLogoPreview}
            alt="University logo"
            style={{ width: logoSizePx, height: logoSizePx, objectFit: 'contain' }}
          />
        </div>
      )}

      {/* University Name */}
      {formData.universityName && (
        <div className="uni-name" style={{ color: themeColor }}>
          {formData.universityName}
        </div>
      )}

      {/* Department */}
      {formData.department && (
        <div className="uni-dept">Department of {formData.department}</div>
      )}

      {/* Session */}
      {formData.session && (
        <div className="uni-session">{formData.session}</div>
      )}

      {/* Horizontal rule */}
      <hr className="tpl-hr" style={{ background: themeColor }} />

      {/* Assignment Type */}
      {formData.assignmentType && (
        <div className="assign-type" style={{ color: themeColor }}>
          {formData.assignmentType}
        </div>
      )}

      {/* Assignment Title */}
      {formData.assignmentTitle && (
        <div className="assign-title">{formData.assignmentTitle}</div>
      )}

      {/* Course */}
      {(formData.courseName || formData.courseCode) && (
        <div className="course-info">
          {formData.courseName && <span className="course-name">{formData.courseName}</span>}
          {formData.courseCode && <>{formData.courseName ? ' | ' : ''}<span className="course-code">{formData.courseCode}</span></>}
        </div>
      )}

      {/* Semester */}
      {formData.semester && (
        <div className="semester-info">{formData.semester}</div>
      )}

      <hr className="tpl-hr" style={{ background: themeColor, marginTop: 20 }} />

      {/* Submitted By / To */}
      {(hasStudents || hasTeacher) && <div className="tpl-by-to">
        {hasStudents && <div className="tpl-by-to-col">
          <div className="tpl-by-to-label submitted-by-heading" style={{ color: themeColor, borderColor: themeColor }}>
            Submitted By
          </div>
          {formData.students.map((s) =>
            hasStudentDetails(s) ? (
              <div key={s.id} style={{ marginBottom: 8, ...getFontScaleStyles(s.fontSizes) }}>
                {s.name && <div className="tpl-person-name student-name">{s.name}</div>}
                {s.studentId && <div className="tpl-person-detail student-id">ID: {s.studentId}</div>}
                {s.sessionYear && <div className="tpl-person-detail student-session-year">Session: {s.sessionYear}</div>}
                {s.department && <div className="tpl-person-detail student-department">{s.department}</div>}
              </div>
            ) : null
          )}
        </div>}

        {hasTeacher && <div className="tpl-by-to-col">
          <div className="tpl-by-to-label submitted-to-heading" style={{ color: themeColor, borderColor: themeColor }}>
            Submitted To
          </div>
          {formData.teacherName && <div className="tpl-person-name teacher-name">{formData.teacherName}</div>}
          {formData.teacherDesignation && (
            <div className="tpl-person-detail teacher-designation">{formData.teacherDesignation}</div>
          )}
          {formData.teacherDepartment && (
            <div className="tpl-person-detail teacher-department">Dept. of {formData.teacherDepartment}</div>
          )}
        </div>}
      </div>}

      <div className="tpl-spacer" />

      <hr className="tpl-hr" style={{ background: themeColor }} />

      {/* Submission Date */}
      {formData.submissionDate && (
        <div className="tpl-date-row">
          Date of Submission: {fmt(formData.submissionDate)}
        </div>
      )}

      {/* Additional Note */}
      {formData.additionalNote && (
        <div className="tpl-note">{formData.additionalNote}</div>
      )}
    </div>
  );
}
