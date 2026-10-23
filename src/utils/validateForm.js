/**
 * All cover-page fields are optional. Users can export a cover with any subset
 * of the information they enter, so the form has no required-field errors.
 */

export function validateForm() {
  return {};
}

/**
 * Returns true if the form has no validation errors.
 */
export function isFormValid(formData) {
  return Object.keys(validateForm(formData)).length === 0;
}
