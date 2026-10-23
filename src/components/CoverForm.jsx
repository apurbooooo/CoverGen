import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Plus, Minus, Trash2, AlertCircle } from 'lucide-react';
import FormSection from './FormSection.jsx';
import LogoUploader from './LogoUploader.jsx';
import TemplateSelector from './TemplateSelector.jsx';
import ThemeSelector from './ThemeSelector.jsx';
import TextColorSelector from './TextColorSelector.jsx';
import { assignmentTypeOptions, fontFamilyOptions } from '../data/templateOptions.js';
import { universities } from '../data/universities.js';
import { revokeImageUrl } from '../utils/imageUtils.js';
import { validateForm } from '../utils/validateForm.js';
import { DEFAULT_FONT_SIZES, DEFAULT_STUDENT_FONT_SIZES, normalizeFontScale } from '../utils/fontSizes.js';
import { getImportedFontFamily, validateFontFile } from '../utils/fontFamily.js';

/**
 * Renders a single form field with label, input/select/textarea, and error message.
 */
function Field({ id, label, required, error, fontSizeControl, children }) {
  return (
    <div className="field-group">
      <div className="field-label-row">
        <label htmlFor={id}>
          {label}
          {required && <span className="required-star" aria-hidden="true">*</span>}
        </label>
        {fontSizeControl}
      </div>
      {children}
      {error && (
        <div className="field-error" role="alert" id={`${id}-error`}>
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}

function FontSizeStepper({ label, value, onChange }) {
  const size = normalizeFontScale(value);

  return (
    <div className="font-size-stepper" role="group" aria-label={`${label} text size`}>
      <button
        type="button"
        className="font-size-step"
        onClick={() => onChange(Math.max(70, size - 5))}
        disabled={size <= 70}
        aria-label={`Make ${label.toLowerCase()} smaller`}
        title={`Make ${label.toLowerCase()} smaller`}
      >
        <Minus size={12} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="font-size-value"
        onClick={() => onChange(100)}
        disabled={size === 100}
        aria-label={`Reset ${label.toLowerCase()} size to default`}
        title="Reset to 100%"
      >
        {size}%
      </button>
      <button
        type="button"
        className="font-size-step"
        onClick={() => onChange(Math.min(150, size + 5))}
        disabled={size >= 150}
        aria-label={`Make ${label.toLowerCase()} larger`}
        title={`Make ${label.toLowerCase()} larger`}
      >
        <Plus size={12} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Main form component. Manages all form input rendering and calls onChange for every change.
 */
export default function CoverForm({ formData, onChange, showErrors, customFontLoading = false, customFontLoadError = '' }) {
  const errors = showErrors ? validateForm(formData) : {};
  const [fontUploadError, setFontUploadError] = useState('');
  const universityRequestRef = useRef(0);
  const selectedCatalogPreviewRef = useRef('');
  const latestFormDataRef = useRef(formData);
  useLayoutEffect(() => {
    latestFormDataRef.current = formData;
  }, [formData]);

  // Generic field updater
  const updateField = useCallback((key, value) => {
    onChange({ [key]: value });
  }, [onChange]);

  function handleFontUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const error = validateFontFile(file);
    if (error) {
      setFontUploadError(error);
      return;
    }

    const fontUrl = URL.createObjectURL(file);
    const customFontFamily = getImportedFontFamily(file.name);
    onChange({
      customFontUrl: fontUrl,
      customFontName: file.name,
      customFontFamily,
      fontFamily: customFontFamily,
    });
    setFontUploadError('');
  }

  function removeImportedFont() {
    onChange({
      customFontUrl: '',
      customFontName: '',
      customFontFamily: '',
      fontFamily: formData.fontFamily === formData.customFontFamily
        ? fontFamilyOptions[0].value
        : formData.fontFamily,
    });
    setFontUploadError('');
  }

  function updateFontSize(key, value) {
    updateField('fontSizes', {
      ...DEFAULT_FONT_SIZES,
      ...formData.fontSizes,
      [key]: normalizeFontScale(value),
    });
  }

  function updateStudentFontSize(idx, key, value) {
    const students = formData.students.map((student, studentIndex) =>
      studentIndex === idx
        ? {
            ...student,
            fontSizes: {
              ...DEFAULT_STUDENT_FONT_SIZES,
              ...student.fontSizes,
              [key]: normalizeFontScale(value),
            },
          }
        : student
    );
    updateField('students', students);
  }

  function fontSizeControl(label, key, studentIndex) {
    const value = studentIndex === undefined
      ? formData.fontSizes?.[key] ?? 100
      : formData.students[studentIndex]?.fontSizes?.[key] ?? 100;

    return (
      <FontSizeStepper
        label={label}
        value={value}
        onChange={(nextValue) => {
          if (studentIndex === undefined) updateFontSize(key, nextValue);
          else updateStudentFontSize(studentIndex, key, nextValue);
        }}
      />
    );
  }

  async function handleUniversityNameChange(value) {
    const requestId = ++universityRequestRef.current;
    const selectedUniversity = universities.find(
      (university) => university.name.toLocaleLowerCase() === value.trim().toLocaleLowerCase()
    );
    const currentPreview = formData.universityLogoPreview;
    const previousCatalogPreview = selectedCatalogPreviewRef.current;
    let expectedPreview = currentPreview;

    if (!selectedUniversity) {
      selectedCatalogPreviewRef.current = '';
      if (previousCatalogPreview && currentPreview === previousCatalogPreview) {
        revokeImageUrl(currentPreview);
        onChange({ universityName: value, universityLogo: null, universityLogoPreview: '' });
      } else {
        updateField('universityName', value);
      }
      return;
    }

    if (previousCatalogPreview && currentPreview === previousCatalogPreview) {
      revokeImageUrl(currentPreview);
      selectedCatalogPreviewRef.current = '';
      expectedPreview = '';
      onChange({ universityName: value, universityLogo: null, universityLogoPreview: '' });
    } else {
      onChange({ universityName: value });
    }

    try {
      const response = await fetch(selectedUniversity.logoUrl);
      if (!response.ok) throw new Error('University logo could not be loaded.');
      const logoBlob = await response.blob();
      if (requestId !== universityRequestRef.current) return;

      const logoFile = new File([logoBlob], selectedUniversity.logoFilename, {
        type: logoBlob.type || 'image/png',
      });
      const latestFormData = latestFormDataRef.current;
      if (
        latestFormData.universityName.trim().toLocaleLowerCase() !== selectedUniversity.name.toLocaleLowerCase() ||
        latestFormData.universityLogoPreview !== expectedPreview
      ) return;

      const previewUrl = URL.createObjectURL(logoFile);
      revokeImageUrl(latestFormData.universityLogoPreview);
      selectedCatalogPreviewRef.current = previewUrl;
      onChange({ universityLogo: logoFile, universityLogoPreview: previewUrl });
    } catch {
      // Keep the chosen university name and any existing logo if an asset fails to load.
    }
  }

  // Student array helpers
  function updateStudent(idx, key, value) {
    const updated = formData.students.map((s, i) =>
      i === idx ? { ...s, [key]: value } : s
    );
    onChange({ students: updated });
  }

  function addStudent() {
    onChange({
      students: [
        ...formData.students,
        {
          id: crypto.randomUUID(),
          name: '',
          studentId: '',
          sessionYear: '',
          department: '',
          fontSizes: { ...DEFAULT_STUDENT_FONT_SIZES },
        }
      ]
    });
  }

  function removeStudent(idx) {
    if (formData.students.length <= 1) return; // keep at least one
    onChange({ students: formData.students.filter((_, i) => i !== idx) });
  }

  return (
    <div className="form-panel" role="form" aria-label="Cover page form">

      {/* ── Section 1: University Information ── */}
      <FormSection number="01" title="University Information" id="section-university">
        <Field
          id="universityName"
          label="University Name"
          required
          error={errors.universityName}
          fontSizeControl={fontSizeControl('University name', 'universityName')}
        >
          <input
            id="universityName"
            type="text"
            value={formData.universityName}
            onChange={(e) => handleUniversityNameChange(e.target.value)}
            list="university-suggestions"
            placeholder="e.g. State University of Technology"
            className={errors.universityName ? 'error' : ''}
            aria-describedby={errors.universityName ? 'universityName-error universityName-hint' : 'universityName-hint'}
            aria-required="true"
            maxLength={120}
          />
          <datalist id="university-suggestions">
            {universities.map((university) => (
              <option key={university.shortName} value={university.name} label={university.shortName} />
            ))}
          </datalist>
          <div id="universityName-hint" className="field-hint">
            Choose AIUB, AUST, BRAC University, or EWU to add its logo automatically. You can also enter another name.
          </div>
        </Field>

        <Field id="logo-upload" label="University Logo (optional)">
          <LogoUploader formData={formData} onChange={onChange} />
        </Field>

        <div className="field-row">
          <Field
            id="department"
            label="Department"
            required
            error={errors.department}
            fontSizeControl={fontSizeControl('Department', 'department')}
          >
            <input
              id="department"
              type="text"
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="e.g. Computer Science"
              className={errors.department ? 'error' : ''}
              aria-describedby={errors.department ? 'department-error' : undefined}
              aria-required="true"
              maxLength={100}
            />
          </Field>

          <Field
            id="session"
            label="Session / Academic Year"
            fontSizeControl={fontSizeControl('Session / academic year', 'session')}
          >
            <input
              id="session"
              type="text"
              value={formData.session}
              onChange={(e) => updateField('session', e.target.value)}
              placeholder="e.g. 2024–2025"
              maxLength={50}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 2: Assignment Information ── */}
      <FormSection number="02" title="Assignment Information" id="section-assignment">
        <Field
          id="assignmentTitle"
          label="Assignment Title"
          required
          error={errors.assignmentTitle}
          fontSizeControl={fontSizeControl('Assignment title', 'assignmentTitle')}
        >
          <input
            id="assignmentTitle"
            type="text"
            value={formData.assignmentTitle}
            onChange={(e) => updateField('assignmentTitle', e.target.value)}
            placeholder="e.g. Analysis of Digital Logic Circuits"
            className={errors.assignmentTitle ? 'error' : ''}
            aria-describedby={errors.assignmentTitle ? 'assignmentTitle-error' : undefined}
            aria-required="true"
            maxLength={200}
          />
        </Field>

        <div className="field-row">
          <Field
            id="assignmentType"
            label="Assignment Type"
            fontSizeControl={fontSizeControl('Assignment type', 'assignmentType')}
          >
            <select
              id="assignmentType"
              value={formData.assignmentType}
              onChange={(e) => updateField('assignmentType', e.target.value)}
            >
              {assignmentTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field
            id="semester"
            label="Semester"
            fontSizeControl={fontSizeControl('Semester', 'semester')}
          >
            <input
              id="semester"
              type="text"
              value={formData.semester}
              onChange={(e) => updateField('semester', e.target.value)}
              placeholder="e.g. Fall 2024 / 5th Semester"
              maxLength={80}
            />
          </Field>
        </div>

        <div className="field-row">
          <Field
            id="courseName"
            label="Course Name"
            required
            error={errors.courseName}
            fontSizeControl={fontSizeControl('Course name', 'courseName')}
          >
            <input
              id="courseName"
              type="text"
              value={formData.courseName}
              onChange={(e) => updateField('courseName', e.target.value)}
              placeholder="e.g. Digital Logic Design"
              className={errors.courseName ? 'error' : ''}
              aria-describedby={errors.courseName ? 'courseName-error' : undefined}
              aria-required="true"
              maxLength={120}
            />
          </Field>

          <Field
            id="courseCode"
            label="Course Code"
            fontSizeControl={fontSizeControl('Course code', 'courseCode')}
          >
            <input
              id="courseCode"
              type="text"
              value={formData.courseCode}
              onChange={(e) => updateField('courseCode', e.target.value)}
              placeholder="e.g. CSE-301"
              maxLength={30}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 3: Submitted By ── */}
      <FormSection
        number="03"
        title="Submitted By"
        id="section-submitted-by"
        headerControl={fontSizeControl('Submitted By heading', 'submittedByHeading')}
      >
        {formData.students.map((student, idx) => (
          <div className="student-entry" key={student.id}>
            <div className="student-entry-header">
              <span className="student-number">Student {idx + 1}</span>
              {formData.students.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeStudent(idx)}
                  aria-label={`Remove student ${idx + 1}`}
                  id={`btn-remove-student-${idx}`}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            <div className="field-row">
              <Field
                id={`student-name-${idx}`}
                label="Student Name"
                required={idx === 0}
                error={errors[`students.${idx}.name`]}
                fontSizeControl={fontSizeControl(`Student ${idx + 1} name`, 'name', idx)}
              >
                <input
                  id={`student-name-${idx}`}
                  type="text"
                  value={student.name}
                  onChange={(e) => updateStudent(idx, 'name', e.target.value)}
                  placeholder="Full name"
                  className={errors[`students.${idx}.name`] ? 'error' : ''}
                  aria-required={idx === 0}
                  maxLength={100}
                />
              </Field>

              <Field
                id={`student-id-${idx}`}
                label="Student ID"
                fontSizeControl={fontSizeControl(`Student ${idx + 1} ID`, 'studentId', idx)}
              >
                <input
                  id={`student-id-${idx}`}
                  type="text"
                  value={student.studentId}
                  onChange={(e) => updateStudent(idx, 'studentId', e.target.value)}
                  placeholder="e.g. 21-CS-045"
                  maxLength={30}
                />
              </Field>
            </div>

            <div className="field-row">
              <Field
                id={`student-session-${idx}`}
                label="Session / Year"
                fontSizeControl={fontSizeControl(`Student ${idx + 1} session`, 'sessionYear', idx)}
              >
                <input
                  id={`student-session-${idx}`}
                  type="text"
                  value={student.sessionYear}
                  onChange={(e) => updateStudent(idx, 'sessionYear', e.target.value)}
                  placeholder="e.g. 2022–2023"
                  maxLength={50}
                />
              </Field>

              <Field
                id={`student-dept-${idx}`}
                label="Department"
                fontSizeControl={fontSizeControl(`Student ${idx + 1} department`, 'department', idx)}
              >
                <input
                  id={`student-dept-${idx}`}
                  type="text"
                  value={student.department}
                  onChange={(e) => updateStudent(idx, 'department', e.target.value)}
                  placeholder="e.g. Computer Science"
                  maxLength={100}
                />
              </Field>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="add-student-btn"
          onClick={addStudent}
          id="btn-add-student"
        >
          <Plus size={16} /> Add Another Student
        </button>
      </FormSection>

      {/* ── Section 4: Submitted To ── */}
      <FormSection
        number="04"
        title="Submitted To"
        id="section-submitted-to"
        headerControl={fontSizeControl('Submitted To heading', 'submittedToHeading')}
      >
        <Field
          id="teacherName"
          label="Instructor / Teacher Name"
          required
          error={errors.teacherName}
          fontSizeControl={fontSizeControl('Instructor name', 'teacherName')}
        >
          <input
            id="teacherName"
            type="text"
            value={formData.teacherName}
            onChange={(e) => updateField('teacherName', e.target.value)}
            placeholder="e.g. Dr. Sarah Johnson"
            className={errors.teacherName ? 'error' : ''}
            aria-describedby={errors.teacherName ? 'teacherName-error' : undefined}
            aria-required="true"
            maxLength={100}
          />
        </Field>

        <div className="field-row">
          <Field
            id="teacherDesignation"
            label="Designation"
            fontSizeControl={fontSizeControl('Instructor designation', 'teacherDesignation')}
          >
            <input
              id="teacherDesignation"
              type="text"
              value={formData.teacherDesignation}
              onChange={(e) => updateField('teacherDesignation', e.target.value)}
              placeholder="e.g. Associate Professor"
              maxLength={100}
            />
          </Field>

          <Field
            id="teacherDepartment"
            label="Department"
            fontSizeControl={fontSizeControl('Instructor department', 'teacherDepartment')}
          >
            <input
              id="teacherDepartment"
              type="text"
              value={formData.teacherDepartment}
              onChange={(e) => updateField('teacherDepartment', e.target.value)}
              placeholder="e.g. Computer Science"
              maxLength={100}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Section 5: Submission Details ── */}
      <FormSection number="05" title="Submission Details" id="section-submission">
        <div className="field-row">
          <Field
            id="submissionDate"
            label="Submission Date"
            required
            error={errors.submissionDate}
            fontSizeControl={fontSizeControl('Submission date', 'submissionDate')}
          >
            <input
              id="submissionDate"
              type="date"
              value={formData.submissionDate}
              onChange={(e) => updateField('submissionDate', e.target.value)}
              className={errors.submissionDate ? 'error' : ''}
              aria-required="true"
            />
          </Field>
        </div>

        <Field
          id="additionalNote"
          label="Additional Note (optional)"
          fontSizeControl={fontSizeControl('Additional note', 'additionalNote')}
        >
          <textarea
            id="additionalNote"
            value={formData.additionalNote}
            onChange={(e) => updateField('additionalNote', e.target.value)}
            placeholder="e.g. Submitted in partial fulfillment of the requirements for..."
            maxLength={300}
            rows={3}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
            {formData.additionalNote.length}/300
          </div>
        </Field>
      </FormSection>

      {/* ── Section 6: Design Customization ── */}
      <FormSection number="06" title="Design Customization" id="section-design" defaultOpen={true}>
        {/* Template Selector */}
        <div>
          <label style={{ marginBottom: '0.625rem' }}>Cover Page Template</label>
          <TemplateSelector
            selected={formData.template}
            themeColor={formData.themeColor}
            onChange={(tpl) => updateField('template', tpl)}
          />
        </div>

        <div className="divider" style={{ margin: '0.5rem 0' }} />

        {/* Theme Color */}
        <div>
          <label>Accent Color</label>
          <ThemeSelector
            themeColor={formData.themeColor}
            onChange={(color) => updateField('themeColor', color)}
          />
        </div>

        <div className="divider" style={{ margin: '0.5rem 0' }} />

        <div>
          <label>Text Color</label>
          <TextColorSelector
            textColor={formData.textColor}
            onChange={(color) => updateField('textColor', color)}
          />
        </div>

        <div className="divider" style={{ margin: '0.5rem 0' }} />

        {/* Font Family */}
        <Field id="fontFamily" label="Document Font">
          <select
            id="fontFamily"
            value={formData.fontFamily}
            onChange={(e) => updateField('fontFamily', e.target.value)}
          >
            {fontFamilyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
            {formData.customFontUrl && formData.customFontFamily && (
              <option value={formData.customFontFamily}>
                Imported: {formData.customFontName || 'Custom font'}
              </option>
            )}
          </select>
        </Field>

        <div className="font-upload-control">
          <label htmlFor="custom-font-upload">Import your own font</label>
          <input
            id="custom-font-upload"
            type="file"
            accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf"
            onChange={handleFontUpload}
            aria-describedby="custom-font-hint"
          />
          <div id="custom-font-hint" className="field-hint">
            WOFF2, WOFF, TTF, and OTF files up to 20 MB. The uploaded font is used in the preview and PDF; DOCX stores the font name and does not embed the font file.
          </div>
          {customFontLoading && (
            <div className="field-hint" role="status">Loading imported font…</div>
          )}
          {formData.customFontName && (
            <div className="font-upload-status">
              <span title={formData.customFontName}>Using {formData.customFontName}</span>
              <button type="button" onClick={removeImportedFont}>Remove</button>
            </div>
          )}
          {(fontUploadError || customFontLoadError) && (
            <div className="field-error" role="alert">
              <AlertCircle size={12} aria-hidden="true" />
              {fontUploadError || customFontLoadError}
            </div>
          )}
        </div>

      </FormSection>

    </div>
  );
}
