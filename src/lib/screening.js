/**
 * multipart/form-data for POST /api/screenings (Swagger: dto + posterImages).
 *
 * @param {object} dto - Screening create/update fields
 * @param {File[]} [posterFiles] - Optional poster image files
 * @returns {FormData}
 */
export function buildScreeningFormData(dto, posterFiles = []) {
  const formData = new FormData();
  formData.append(
    'dto',
    new Blob([JSON.stringify(dto)], { type: 'application/json' })
  );
  posterFiles.forEach((file) => {
    if (file) formData.append('posterImages', file);
  });
  return formData;
}
