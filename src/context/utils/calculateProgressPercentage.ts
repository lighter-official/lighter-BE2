export function calculateProgressPercentage(target: number, current: number) {
  return Math.round((current / target) * 100);
}
