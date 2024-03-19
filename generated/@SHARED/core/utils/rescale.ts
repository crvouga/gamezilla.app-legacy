type Range = [
    number,
    number
];
/**
 * @example
 * // assume a ∈ [0, 100]
 * const a = 10
 * const b = rescale({ value: a, from: [0, 100], to: [0, 10] }) //=> 1
 */
export const rescale = ({ value, from, to, }: {
    value: number;
    from: Range;
    to: Range;
}) => {
    return ((value - from[0]) * (to[1] - to[0])) / (from[1] - from[0]) + to[0];
};
