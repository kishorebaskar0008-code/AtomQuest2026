/**
 * Helper to determine current quarter and window status
 * Based on Page 3 of Project Document
 */
export function getCurrentQuarterInfo(cycle) {
  if (!cycle) return null;

  const now = new Date();
  
  const parseDate = (dateStr, suffix) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + suffix);
    return isNaN(d.getTime()) ? null : d;
  };

  const windows = [
    { name: 'Q1', start: parseDate(cycle.q1_start, 'T00:00:00'), end: parseDate(cycle.q1_end, 'T23:59:59') },
    { name: 'Q2', start: parseDate(cycle.q2_start, 'T00:00:00'), end: parseDate(cycle.q2_end, 'T23:59:59') },
    { name: 'Q3', start: parseDate(cycle.q3_start, 'T00:00:00'), end: parseDate(cycle.q3_end, 'T23:59:59') },
    { name: 'Q4', start: parseDate(cycle.q4_start, 'T00:00:00'), end: parseDate(cycle.q4_end, 'T23:59:59') },
  ];

  // Filter out any windows with invalid dates
  const validWindows = windows.filter(w => w.start && w.end);
  if (validWindows.length === 0) return null;

  const activeWindow = validWindows.find(w => now >= w.start && now <= w.end);
  
  if (activeWindow) {
    return { ...activeWindow, isOpen: true };
  }

  const nextWindow = validWindows.find(w => now < w.start);
  if (nextWindow) {
    return { ...nextWindow, isOpen: false };
  }

  return { ...validWindows[0], isOpen: false };
}
