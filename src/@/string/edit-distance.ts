export function editDistance(s1: string, s2: string): number {
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
