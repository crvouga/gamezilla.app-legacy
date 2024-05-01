/**
 * Delays the execution of a function until a certain amount of time has passed since the last time it was called.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay time in milliseconds.
 * @returns {Function} - A new function that limits the rate at which `func` can be executed.
 *
 * @example
 *
 * // Define a function that logs a message
 * const logMessage = (message) => console.log(message);
 *
 * // Create a debounced version of the function with a 500ms delay
 * const debouncedLogMessage = debounce(logMessage, 500);
 *
 * // Call the debounced function multiple times in quick succession
 * debouncedLogMessage('Hello');
 * debouncedLogMessage('World');
 * debouncedLogMessage('!');
 *
 * // Only the last call to the debounced function will be executed after 500ms
 */
export const debounce = <F extends (...args: unknown[]) => unknown>(
	func: F,
	delay: number,
): DebouncedFunction<F> => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args: Parameters<F>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			return func(...args);
		}, delay);

		return undefined;
	};
};
type DebouncedFunction<F extends (...args: unknown[]) => unknown> = (
	...args: Parameters<F>
) => ReturnType<F> | undefined;
