/**
 * Helper to determine current quarter and window status
 * Based on Page 3 of Project Document
 */
export function getCurrentQuarterInfo(cycle) {
  if (!cycle) return null;

  const now = new Date();
  
  const windows = [
    { name: 'Q1', start: new Date(cycle.q1_start), end: new Date(cycle.q1_end) },
    { name: 'Q2', start: new Date(cycle.q2_start), end: new Date(cycle.q2_end) },
    { name: 'Q3', start: new Date(cycle.q3_start), end: new Date(cycle.q3_end) },
    { name: 'Q4', start: new Date(cycle.q4_start), end: new Date(cycle.q4_end) },
  ];

  // For the hackathon, if no window is "open" today, we'll return the next one or the most recent one
  // but strictly, we check which window 'now' falls into.
  const activeWindow = windows.find(w => now >= w.start && now <= w.end);
  
  if (activeWindow) {
    return { ...activeWindow, isOpen: true };
  }

  // If not in a window, find the next one
  const nextWindow = windows.find(w => now < w.start);
  if (nextWindow) {
    return { ...nextWindow, isOpen: false };
  }

  // Default to Q1 if something is weird
  return { ...windows[0], isOpen: false };
}
