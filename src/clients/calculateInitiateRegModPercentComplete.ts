/**
 * Calculate progress for reg mod creation. Position starts at an arbitrary
 * number (initialPosition) and counts towards zero.
 */
export default function calculateInitiateRegModPercentComplete(
  initialPosition: $TSFixMe,
  position: $TSFixMe
): $TSFixMe {
  return 100 * (initialPosition === 0 ? 1 : 1 - position / initialPosition);
}
