/**
 * JSON body for POST `/api/bookings/lock` (bus seat lock / reservation).
 *
 * @param {object} params
 * @param {number|string} params.scheduleId
 * @param {Array<number|string>} params.seatNumbers
 * @param {Array<string>} [params.seatLabels]
 * @param {string} params.applicantCid
 * @param {string} params.applicantMobile
 * @param {string} params.applicantEmail
 * @param {string} [params.status]
 */
export function buildBusLockBookingPayload({
  scheduleId,
  seatNumbers,
  seatLabels = [],
  applicantCid,
  applicantMobile,
  applicantEmail,
  status = 'PENDING',
}) {
  const sid = parseInt(String(scheduleId), 10);
  const nums = (Array.isArray(seatNumbers) ? seatNumbers : []).map((s) => {
    const raw =
      s != null && typeof s === 'object'
        ? s.startNo ?? s.seatNumber ?? s.id ?? s.number
        : s;
    const n = parseInt(String(raw), 10);
    if (Number.isFinite(n)) return n;
    const digits = parseInt(String(raw).replace(/\D/g, ''), 10);
    return Number.isFinite(digits) ? digits : 0;
  });

  let labels = (Array.isArray(seatLabels) ? seatLabels : []).map((l) =>
    l == null ? '' : String(l).trim()
  );
  while (labels.length < nums.length) {
    labels.push(String(nums[labels.length] ?? ''));
  }
  labels = labels.slice(0, nums.length);

  return {
    scheduleId: Number.isFinite(sid) ? sid : 0,
    seatNumbers: nums,
    seatLabels: labels,
    applicantCid: String(applicantCid || '').trim(),
    applicantMobile: String(applicantMobile || '').trim(),
    applicantEmail: String(applicantEmail || '').trim(),
    status: String(status || 'PENDING').trim(),
  };
}
