import { getLogoPreviewSize } from '../utils/imageUtils.js';
import { getFontScaleStyles } from '../utils/fontSizes.js';
import { getCssFontFamily } from '../utils/fontFamily.js';
import { hasStudentDetails, hasTeacherDetails } from '../utils/coverContent.js';

function fmt(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}

/**
 * MODERN MINIMAL template preview.
 * Left-aligned layout with a vertical color sidebar accent.
 */
export default function ModernMinimal({ formData }) {
  const { themeColor, fontFamily, universityLogoPreview, logoSize } = formData;
  const logoSizePx = getLogoPreviewSize(logoSize);
  const hasStudents = formData.students.some(hasStudentDetails);
  const hasTeacher = hasTeacherDetails(formData);

  return (
    <div
      className="tpl-page tpl-modern"
      style={{ fontFamily: getCssFontFamily(fontFamily, 'sans-serif'), position: 'relative', '--document-text-color': formData.textColor || '#1A202C' }}
    >
      {/* Left sidebar bar */}
      <div
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 12, background: themeColor,
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      {universityLogoPreview && (
        <div className="uni-logo" style={{ marginTop: 20 }}>
          <img
            src={universityLogoPreview}
            alt="University logo"
            style={{ width: logoSizePx, height: logoSizePx, objectFit: 'contain' }}
          />
        </div>
      )}

      {!universityLogoPreview && <div style={{ height: 30 }} />}

      {/* University Name */}
      {formData.universityName && (
        <div className="uni-name" style={{ color: themeColor }}>
          {formData.universityName}
        </div>
      )}

      {formData.department && (
        <div className="uni-dept">Department of {formData.department}</div>
      )}

      {formData.session && (
        <div className="uni-session">{formData.session}</div>
      )}

      <hr className="tpl-hr" style={{ background: themeColor, opacity: 0.5, margin: '16px 0' }} />

      {/* Assignment */}
      {formData.assignmentType && (
        <div className="assign-type" style={{ color: themeColor }}>
          {formData.assignmentType}
        </div>
      )}

      {formData.assignmentTitle && (
        <div className="assign-title">{formData.assignmentTitle}</div>
      )}

      {(formData.courseName || formData.courseCode) && (
        <div className="course-info">
          {formData.courseName && <span className="course-name">{formData.courseName}</span>}
          {formData.courseCode && <>{formData.courseName ? ' · ' : ''}<span className="course-code">{formData.courseCode}</span></>}
        </div>
      )}

      {formData.semester && (
        <div className="semester-info">{formData.semester}</div>
      )}

      <div className="tpl-spacer" />

      <hr style={{ height: 1, background: '#CBD5E0', border: 'none', margin: '16px 0' }} />

      {/* Submitted By */}
      {hasStudents && (
        <div style={{ marginBottom: 16 }}>
          <div className="by-to-label submitted-by-heading" style={{ color: themeColor }}>SUBMITTED BY</div>
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
        </div>
      )}

      {/* Submitted To */}
      {hasTeacher && (
        <div style={{ marginBottom: 16 }}>
          <div className="by-to-label submitted-to-heading" style={{ color: themeColor }}>SUBMITTED TO</div>
          {formData.teacherName && <div className="tpl-person-name teacher-name">{formData.teacherName}</div>}
          {formData.teacherDesignation && (
            <div className="tpl-person-detail teacher-designation">{formData.teacherDesignation}</div>
          )}
          {formData.teacherDepartment && (
            <div className="tpl-person-detail teacher-department">Department of {formData.teacherDepartment}</div>
          )}
        </div>
      )}

      {/* Date */}
      {formData.submissionDate && (
        <div className="tpl-date-row">
          {fmt(formData.submissionDate)}
        </div>
      )}

      {formData.additionalNote && (
        <div className="tpl-note">{formData.additionalNote}</div>
      )}
    </div>
  );
}
