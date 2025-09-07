/**
 * Flag indicating whether the current test run is an integration test.
 * Set to true when the IS_INTEGRATION_TEST environment variable is 'true'.
 * Used to conditionally run integration tests that require external services like databases.
 */
export const IS_INTEGRATION_TEST = process.env.IS_INTEGRATION_TEST === 'true'
