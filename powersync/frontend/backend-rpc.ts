import { p } from '~/@/parser'
import { Err, isErr, Ok, Result } from '~/@/result'
import { CONFIG_FRONTEND } from '~/config/frontend'

const getPowersyncCredentials = async (): Promise<Result<string, { token: string }>> => {
  try {
    const PATH = '/powersync/credentials'
    let urlString = PATH
    try {
      const url = new URL(ensureProtocol(String(CONFIG_FRONTEND.VITE_BACKEND_URL)))
      url.pathname = PATH
      urlString = url.toString()
    } catch (e) {
      urlString = PATH
    }

    const response = await fetch(urlString, { credentials: 'include' })

    const responseJson: unknown = await response.json()

    const parsed = p
      .obj({
        token: p.str,
      })
      .parse(responseJson)

    if (isErr(parsed)) {
      console.error('Failed to parse response', responseJson, parsed.error)
      return Err('Failed to parse response')
    }
    return Ok(parsed.value)
  } catch (e) {
    console.error('Failed to fetch credentials', e)
    return Err('Failed to fetch credentials')
  }
}

const ensureProtocol = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return 'https://' + url
}

export const BackendAppRpc = {
  getPowersyncCredentials,
}
