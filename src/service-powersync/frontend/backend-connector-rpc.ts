import { Err, isErr, Ok, Result } from '~/@/result'
import { s } from '~/@/schema'
import { CONFIG_SHARED } from '~/config/shared'

const fetchCredentials = async (): Promise<Result<string, { token: string }>> => {
  try {
    const PATH = '/powersync/credentials'
    let urlString = PATH
    try {
      const url = new URL(ensureProtocol(String(CONFIG_SHARED.BACKEND_URL)))
      url.pathname = PATH
      urlString = url.toString()
    } catch (e) {
      urlString = PATH
    }

    const response = await fetch(urlString, {
      credentials: 'include',
    })

    const responseJson: unknown = await response.json()

    const parsed = s
      .obj({
        token: s.str(),
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

export const BackendConnectorRPC = {
  fetchCredentials,
}
