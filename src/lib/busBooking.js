/**
 * JSON body for POST `/api/bookings/lock` (bus seat lock / reservation).
 *
 * @param {object} params
 * @param {number|string} params.scheduleId
 * @param {Array<number|string>} params.seatNumbers
 * @param {Array<string>} [params.seatLabels]
 * @param {Array<string>} [params.applicantCids] — one CID per seat (same order as seatNumbers)
 * @param {Array<string>} [params.applicantNames] — one name per seat (same order as seatNumbers)
 * @param {Array<string>} [params.applicantMobiles] — one mobile per seat (UI); first non-empty is sent as applicantMobile
 * @param {string} [params.applicantMobile] — booking contact mobile (overrides applicantMobiles when set)
 * @param {string} [params.applicantEmail]
 * @param {string} [params.status]
 */
export function buildBusLockBookingPayload({
  scheduleId,
  seatNumbers,
  seatLabels = [],
  applicantCids = [],
  applicantNames = [],
  applicantMobiles = [],
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

  const cids = padStringArray(applicantCids, nums.length);
  const names = padStringArray(applicantNames, nums.length);

  return {
    scheduleId: Number.isFinite(sid) ? sid : 0,
    seatNumbers: nums,
    seatLabels: labels,
    applicantCids: cids.map((c) => String(c || '').trim()),
    applicantNames: names.map((n) => String(n || '').trim()),
    applicantMobile: resolveApplicantMobile(applicantMobile, applicantMobiles),
    applicantEmail: String(applicantEmail || '').trim(),
    status: String(status || 'PENDING').trim(),
  };
}

/**
 * Keeps per-seat CID, name, and mobile when seats are added or removed.
 */
export function syncApplicantArraysForSeats(
  seatNumbers,
  seatLabels,
  prevCids,
  prevNames,
  prevSeatNumbers,
  prevMobiles = []
) {
  const bySeat = new Map();
  (Array.isArray(prevSeatNumbers) ? prevSeatNumbers : []).forEach((num, i) => {
    bySeat.set(String(num), {
      cid: (prevCids || [])[i] ?? '',
      name: (prevNames || [])[i] ?? '',
      mobile: (prevMobiles || [])[i] ?? '',
    });
  });
  return {
    seatNumbers,
    seatLabels,
    applicantCids: seatNumbers.map((n) => bySeat.get(String(n))?.cid ?? ''),
    applicantNames: seatNumbers.map((n) => bySeat.get(String(n))?.name ?? ''),
    applicantMobiles: seatNumbers.map((n) => bySeat.get(String(n))?.mobile ?? ''),
  };
}

export function resolveApplicantMobile(applicantMobile, applicantMobiles = []) {
  const direct = String(applicantMobile || '').trim();
  if (direct) return direct;
  const fromSeats = (Array.isArray(applicantMobiles) ? applicantMobiles : [])
    .map((m) => String(m || '').trim())
    .find(Boolean);
  return fromSeats || '';
}

function padStringArray(arr, length) {
  const source = Array.isArray(arr) ? arr : [];
  const out = source.map((v) => (v == null ? '' : String(v)));
  while (out.length < length) out.push('');
  return out.slice(0, length);
}
