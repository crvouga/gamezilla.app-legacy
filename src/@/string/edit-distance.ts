/**
 * Calculates the Levenshtein distance between two strings
 * @param s1 The first string
 * @param s2 The second string
 * @returns The minimum number of single-character edits required to change s1 into s2
 * @example
 * editDistance('cat', 'cut') // returns 1
 * editDistance('kitten', 'sitting') // returns 3
 * editDistance('sunday', 'saturday') // returns 3
 * editDistance('', 'hello') // returns 5
 */
export const editDistance = (s1: string, s2: string): number => {
  const m = s1.length
  const n = s2.length
  const dp: number[][] = []

  for (let i = 0; i <= m; i++) {
    dp[i] = [i]
  }

  for (let j = 0; j <= n; j++) {
    // @ts-ignore
    dp[0][j] = j
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      // @ts-ignore
      dp[i][j] = Math.min(
        // @ts-ignore
        dp[i - 1][j] + 1,
        // @ts-ignore
        dp[i][j - 1] + 1,
        // @ts-ignore
        dp[i - 1][j - 1] + cost,
      )
    }
  }

  // @ts-ignore
  return dp[m][n]
}
