/**
 * Repeatedly tries to execute a function until it succeeds or times out.
 * Useful for testing async operations that may take time to complete.
 *
 * @param fn Function to execute that returns a Promise
 * @param timeoutMs Maximum time to keep retrying in milliseconds (default: 200)
 * @param intervalMs Time between retries in milliseconds (default: 10)
 *
 * @example
 * ```ts
 * // Wait for element to appear in DOM
 * await eventually(async () => {
 *   const element = document.querySelector('.my-element')
 *   expect(element).toBeDefined()
 * })
 *
 * // Wait for async state change with custom timeout
 * await eventually(
 *   async () => {
 *     expect(someAsyncState).toEqual('expected value')
 *   },
 *   1000, // 1 second timeout
 *   50    // Check every 50ms
 * )
 * ```
 */
export const eventually = async (
  fn: () => Promise<void> | void,
  config: { intervalMs?: number; minimalSuccesses?: number; maxAttempts?: number } = {},
) => {
  const { intervalMs = 10, minimalSuccesses = 3, maxAttempts = 10 } = config
  let successes = 0
  let attempts = 0
  while (true) {
    try {
      await fn()
      successes++
      if (successes >= minimalSuccesses) return
    } catch (e) {
      if (attempts >= maxAttempts - 1) throw e
      successes = 0
    } finally {
      await new Promise((r) => setTimeout(r, intervalMs))
      attempts++
    }
  }
}
