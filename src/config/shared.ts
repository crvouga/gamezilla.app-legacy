const IS_TEST = import.meta.env?.NODE_ENV === 'test'

const IS_INTEGRATION_TEST = IS_TEST && import.meta.env?.IS_INTEGRATION_TEST === 'true'

const IS_UNIT_TEST = IS_TEST && !IS_INTEGRATION_TEST

const IS_PROD = Boolean(import.meta.env?.PROD)

const IS_LOCAL = !IS_PROD

export const CONFIG_SHARED = {
  IS_INTEGRATION_TEST,
  IS_UNIT_TEST,
  IS_TEST,
  IS_PROD,
  IS_LOCAL,
}
