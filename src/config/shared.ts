const IS_TEST = import.meta.env?.NODE_ENV === 'test'

const IS_INTEGRATION_TEST = IS_TEST && import.meta.env?.IS_INTEGRATION_TEST === 'true'

const IS_UNIT_TEST = IS_TEST && !IS_INTEGRATION_TEST

const IS_PROD = Boolean(
  import.meta.env?.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'),
)

const IS_LOCAL = !IS_PROD

const BACKEND_URL = IS_PROD ? 'https://backend.gamezilla.app' : 'http://localhost:5002'

const POWERSYNC_URL = IS_PROD ? 'https://powersync.gamezilla.app' : 'http://localhost:8080'

export const CONFIG_SHARED = {
  IS_INTEGRATION_TEST,
  IS_UNIT_TEST,
  IS_TEST,
  IS_PROD,
  IS_LOCAL,
  BACKEND_URL,
  POWERSYNC_URL,
}
