import { getLogoPreviewSize } from '../utils/imageUtils.js';
import { getFontScaleStyles } from '../utils/fontSizes.js';

function fmt(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return dateStr; }
}

/**
 * FORMAL UNIVERSITY template preview.
 * Box-bordered institutional style with colored header band for the university name.
 */
export default function FormalUniversity({ formData }) {
  const { themeColor, fontFamily, universityLogoPreview, logoSize } = formData;
  const logoSizePx = getLogoPreviewSize(logoSize);

  return (
    <div
      className="tpl-page tpl-formal"
      style={{ fontFamily: `'${fontFamily}', serif`, '--document-text-color': formData.textColor || '#1A202C' }}
    >
      {/* Logo */}
      {universityLogoPreview && (
        <div className="uni-logo" style={{ marginTop: 10 }}>
          <img
            src={universityLogoPreview}
            alt="University logo"
            style={{ width: logoSizePx, height: logoSizePx, objectFit: 'contain' }}
          />
        </div>
      )}

      {!universityLogoPreview && <div style={{ height: 20 }} />}

      {/* University name in colored band */}
      {formData.universityName && (
        <div
          className="uni-header-band"
          style={{ background: themeColor }}
        >
          <div className="uni-name">{formData.universityName}</div>
        </div>
      )}

      {formData.department && (
        <div className="uni-dept">Department of {formData.department}</div>
      )}

      {formData.session && (
        <div className="uni-session">{formData.session}</div>
      )}

      {/* Assignment info in bordered box */}
      <div
        className="assign-box"
        style={{ borderColor: themeColor }}
      >
        {formData.assignmentType && (
          <div className="assign-type" style={{ color: themeColor }}>
            {formData.assignmentType}
          </div>
        )}

        {formData.assignmentTitle && (
          <div className="assign-title">{formData.assignmentTitle}</div>
        )}

        {formData.courseName && (
          <div className="course-info">
            <span className="course-name">{formData.courseName}</span>
            {formData.courseCode && <> | <span className="course-code">{formData.courseCode}</span></>}
          </div>
        )}

        {formData.semester && (
          <div className="semester-info">{formData.semester}</div>
        )}
      </div>

      {/* Submitted By / To */}
      <div className="tpl-by-to">
        <div className="tpl-by-to-col">
          <div className="tpl-by-to-label submitted-by-heading" style={{ color: themeColor, borderColor: themeColor }}>
            Submitted By
          </div>
          {formData.students.map((s) =>
            s.name ? (
              <div key={s.id} style={{ marginBottom: 8, ...getFontScaleStyles(s.fontSizes) }}>
                <div className="tpl-person-name student-name">{s.name}</div>
                {s.studentId && <div className="tpl-person-detail student-id">ID: {s.studentId}</div>}
                {s.sessionYear && <div className="tpl-person-detail student-session-year">Session: {s.sessionYear}</div>}
                {s.department && <div className="tpl-person-detail student-department">{s.department}</div>}
              </div>
            ) : null
          )}
        </div>

        <div className="tpl-by-to-col">
          <div className="tpl-by-to-label submitted-to-heading" style={{ color: themeColor, borderColor: themeColor }}>
            Submitted To
          </div>
          {formData.teacherName && (
            <>
              <div className="tpl-person-name teacher-name">{formData.teacherName}</div>
              {formData.teacherDesignation && (
                <div className="tpl-person-detail teacher-designation">{formData.teacherDesignation}</div>
              )}
              {formData.teacherDepartment && (
                <div className="tpl-person-detail teacher-department">Dept. of {formData.teacherDepartment}</div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="tpl-spacer" />

      <hr className="tpl-hr" style={{ background: themeColor, opacity: 0.4 }} />

      {formData.submissionDate && (
        <div className="tpl-date-row">
          Submission Date: {fmt(formData.submissionDate)}
        </div>
      )}

      {formData.additionalNote && (
        <div className="tpl-note">{formData.additionalNote}</div>
      )}
    </div>
  );
}
