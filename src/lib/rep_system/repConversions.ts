export function convertRepToStar(rep: number): number {
    let star = 5 * ((rep - 300) / 1700);
    return roundToTwoDecimals(star);
}

function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}