/**
 * @example
 * // assume a ∈ [0, 100]
 * const a = 10
 * const b = rescale({ value: a, from: [0, 100], to: [0, 10] }) //=> 1
 */
export const rescale = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {
  return ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin
}
