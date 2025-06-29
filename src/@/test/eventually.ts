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
export const eventually = async (fn: () => Promise<void>, timeoutMs = 200, intervalMs = 10) => {
  const deadline = Date.now() + timeoutMs
  while (true) {
    try {
      await fn()
      return
    } catch (err) {
      if (Date.now() > deadline) throw err
      await new Promise((r) => setTimeout(r, intervalMs))
    }
  }
}
