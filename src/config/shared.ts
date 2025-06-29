const IS_TEST = process.env?.NODE_ENV === 'test'

const IS_INTEGRATION_TEST = IS_TEST && process.env?.IS_INTEGRATION_TEST === 'true'

const IS_UNIT_TEST = IS_TEST && !IS_INTEGRATION_TEST

const IS_PROD = String(process.env?.PROD) === 'true'

const IS_LOCAL = !IS_PROD

const BACKEND_URL = IS_PROD ? 'https://backend.gamezilla.app' : 'http://localhost:5002'

const POWERSYNC_URL = IS_PROD ? 'https://powersync.gamezilla.app' : 'http://localhost:8088'

export const CONFIG_SHARED = {
  IS_INTEGRATION_TEST,
  IS_UNIT_TEST,
  IS_TEST,
  IS_PROD,
  IS_LOCAL,
  BACKEND_URL,
  POWERSYNC_URL,
}
