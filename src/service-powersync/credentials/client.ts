import { ILogger } from '~/@/logger'
import { Err, isErr, Ok, Result } from '~/@/result'
import { CredentialsResponseBodyOk, ENDPOINT } from './types'

const request = async (config: {
  backendUrl: string
  logger: ILogger
}): Promise<Result<string, { token: string; endpoint: string }>> => {
  try {
    let urlString = ENDPOINT
    try {
      const url = new URL(ensureProtocol(String(config.backendUrl)))
      url.pathname = ENDPOINT
      urlString = url.toString()
    } catch (e) {
      urlString = ENDPOINT
    }

    const response = await fetch(urlString, {
      credentials: 'include',
    })

    const responseJson: unknown = await response.json()

    const parsed = CredentialsResponseBodyOk.parse(responseJson)

    if (isErr(parsed)) {
      const errorMessage = `Failed to parse response: ${parsed.error}`
      config.logger.error(errorMessage, responseJson)
      return Err(errorMessage)
    }
    return Ok(parsed.value)
  } catch (e) {
    const errorMessage = `Failed to fetch credentials: ${e}`
    config.logger.error(errorMessage)
    return Err(errorMessage)
  }
}

const ensureProtocol = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return 'https://' + url
}

export const CredentialsClient = {
  request,
}
