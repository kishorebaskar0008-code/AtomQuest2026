/**
 * Calculates progress score based on UoM Type
 * Formulas as per Phase 4 Plan (Page 44 of Project Document)
 */
export function calculateProgressScore(uomType, target, actual) {
  if (actual === null || actual === undefined || actual === '') return 0;
  
  const targetVal = Number(target);
  const actualVal = Number(actual);

  // Handle division by zero or invalid numbers
  if (isNaN(targetVal) || isNaN(actualVal)) return 0;

  let score = 0;

  switch (uomType) {
    case 'numeric_min':
      // Higher actual = better. Formula: (actual / target) * 100
      score = targetVal > 0 ? (actualVal / targetVal) * 100 : 0;
      break;

    case 'numeric_max':
      // Lower actual = better. Formula: (target / actual) * 100
      score = actualVal > 0 ? (targetVal / actualVal) * 100 : 0;
      break;

    case 'timeline':
      // actual_date <= target_date = 100%, else 0%
      // In JS, we compare date strings or objects
      const actualDate = new Date(actual);
      const targetDate = new Date(target);
      score = actualDate <= targetDate ? 100 : 0;
      break;

    case 'zero_based':
      // actual = 0 = 100%, else 0%
      score = actualVal === 0 ? 100 : 0;
      break;

    default:
      score = 0;
  }

  // Always round to 2 decimal places and cap at 100% (unless specific rules say otherwise)
  // Plan says: "LEAST((actual/target)*100, 100)"
  return Math.min(Math.max(0, Number(score.toFixed(2))), 100);
}
