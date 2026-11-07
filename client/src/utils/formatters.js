export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatNumber = (num, decimals = 3) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Number(num).toFixed(decimals);
};

export const getHpiBadge = (hpi) => {
  if (hpi === null || hpi === undefined || isNaN(hpi)) {
    return { label: 'Uncalculated', className: 'badge-neutral', color: '#64748b' };
  }
  if (hpi > 100) {
    return { label: 'High Pollution (>100)', className: 'badge-danger', color: '#ef4444' };
  }
  if (hpi >= 50) {
    return { label: 'Medium / Threshold (50-100)', className: 'badge-warning', color: '#f59e0b' };
  }
  return { label: 'Low Pollution (<50)', className: 'badge-success', color: '#10b981' };
};

export const getHeiBadge = (hei) => {
  if (hei === null || hei === undefined || isNaN(hei)) {
    return { label: 'Uncalculated', className: 'badge-neutral', color: '#64748b' };
  }
  if (hei > 20) {
    return { label: 'High Heavy Metal (>20)', className: 'badge-danger', color: '#ef4444' };
  }
  if (hei >= 10) {
    return { label: 'Medium Heavy Metal (10-20)', className: 'badge-warning', color: '#f59e0b' };
  }
  return { label: 'Low Heavy Metal (<10)', className: 'badge-success', color: '#10b981' };
};

export const getReviewBadge = (reviewState) => {
  switch (reviewState) {
    case 'Within selected threshold':
      return { label: 'Within Threshold', className: 'badge-success', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
    case 'Requires review':
      return { label: 'Requires Review', className: 'badge-warning', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
    case 'Exceeds selected threshold':
      return { label: 'Critical Threshold Exceeded', className: 'badge-danger', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
    default:
      return { label: 'Pending Assessment', className: 'badge-neutral', bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8' };
  }
};

export const METAL_NAMES = {
  PB: 'Lead (Pb)',
  CD: 'Cadmium (Cd)',
  CR: 'Chromium (Cr)',
  CU: 'Copper (Cu)',
  ZN: 'Zinc (Zn)',
  NI: 'Nickel (Ni)',
  FE: 'Iron (Fe)',
  AS: 'Arsenic (As)',
  HG: 'Mercury (Hg)',
};
