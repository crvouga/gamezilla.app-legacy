/**
 *
 * @example
 * eq({}, {}) \\=> true
 * eq({a: {}}, {a: {}}) \\=> true
 * eq({a: { b: [1] }}, {a: { b: [1] }}) \\=> true
 * eq({a: { b: [1] }}, {a: { b: [1, 2] }}) \\=> false
 *
 */
export function eq(a: unknown, b: unknown): boolean {
    return deepEqual(a, b);
}
function deepEqual(a: unknown, b: unknown, visitedA: Set<unknown> = new Set(), visitedB: Set<unknown> = new Set()): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a !== "object" ||
        typeof b !== "object" ||
        a === null ||
        b === null) {
        return false;
    }
    if (visitedA.has(a) || visitedB.has(b)) {
        return false;
    }
    const aKeys = Object.keys(a as Record<string, unknown>);
    const bKeys = Object.keys(b as Record<string, unknown>);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    visitedA.add(a);
    visitedB.add(b);
    for (const key of aKeys) {
        if (!bKeys.includes(key)) {
            return false;
        }
        if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], visitedA, visitedB)) {
            return false;
        }
    }
    return true;
}
