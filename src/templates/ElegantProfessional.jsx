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
 * ELEGANT PROFESSIONAL template preview.
 * Refined layout with top & bottom color bands and centered composition.
 */
export default function ElegantProfessional({ formData }) {
  const { themeColor, fontFamily, universityLogoPreview, logoSize } = formData;
  const logoSizePx = getLogoPreviewSize(logoSize);
  const hasStudents = formData.students.some(hasStudentDetails);
  const hasTeacher = hasTeacherDetails(formData);

  return (
    <div
      className="tpl-page tpl-elegant"
      style={{ fontFamily: getCssFontFamily(fontFamily, 'serif'), '--document-text-color': formData.textColor || '#1A202C' }}
    >
      {/* Top decorative band */}
      <div className="top-band" style={{ background: themeColor }} aria-hidden="true" />

      {/* Content area with top padding to clear band */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>
        {/* Logo */}
        {universityLogoPreview && (
          <div style={{ marginBottom: 14 }}>
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

        {formData.department && (
          <div className="uni-dept">Department of {formData.department}</div>
        )}

        {formData.session && (
          <div className="uni-session">{formData.session}</div>
        )}

        {/* Thin accent rule */}
        <div
          className="thin-rule"
          style={{ background: themeColor, opacity: 0.4 }}
        />

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

        {/* Light rule */}
        <div style={{ width: '70%', height: 1, background: '#E2E8F0', margin: '20px auto' }} />

        {/* Submitted By / To */}
        {(hasStudents || hasTeacher) && <div className="tpl-by-to" style={{ width: '100%' }}>
          {hasStudents && <div className="tpl-by-to-col">
            <div className="elegant-by-to-label submitted-by-heading" style={{ color: themeColor, marginBottom: 10 }}>
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
            <div className="elegant-by-to-label submitted-to-heading" style={{ color: themeColor, marginBottom: 10 }}>
              Submitted To
            </div>
            {formData.teacherName && <div className="tpl-person-name teacher-name">{formData.teacherName}</div>}
            {formData.teacherDesignation && (
              <div className="tpl-person-detail teacher-designation">{formData.teacherDesignation}</div>
            )}
            {formData.teacherDepartment && (
              <div className="tpl-person-detail teacher-department">Department of {formData.teacherDepartment}</div>
            )}
          </div>}
        </div>}

        {formData.additionalNote && (
          <div className="tpl-note" style={{ marginTop: 12 }}>{formData.additionalNote}</div>
        )}
      </div>

      {/* Bottom band with date */}
      <div className="bottom-band" style={{ background: themeColor }}>
        {formData.submissionDate && (
          <span className="bottom-band-text">
            {fmt(formData.submissionDate)}
          </span>
        )}
      </div>
    </div>
  );
}
