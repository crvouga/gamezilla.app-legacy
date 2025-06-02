const IS_TEST = import.meta.env?.NODE_ENV === 'test'

const IS_INTEGRATION_TEST = IS_TEST && import.meta.env?.IS_INTEGRATION_TEST === 'true'

const IS_UNIT_TEST = IS_TEST && !IS_INTEGRATION_TEST

const IS_PROD = Boolean(import.meta.env?.PROD)

const IS_LOCAL = !IS_PROD

const ORIGIN_WHITELIST_PROD = ['https://gamezilla.app']
const ORIGIN_WHITELIST_DEV = ['http://localhost:5173', 'http://localhost:5174']
const ORIGIN_WHITELIST = IS_PROD ? ORIGIN_WHITELIST_PROD : ORIGIN_WHITELIST_DEV

export const CONFIG_SHARED = {
  IS_INTEGRATION_TEST,
  IS_UNIT_TEST,
  IS_TEST,
  IS_PROD,
  IS_LOCAL,
  ORIGIN_WHITELIST,
}
