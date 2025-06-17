import { ILogger } from '~/@/logger'
import { Err, isErr, Ok, Result } from '~/@/result'
import { UserId } from '~/app/@/data/user-id'
import { CredentialsResponseBodyOk, ENDPOINT, GUEST_USER_ID_QUERY_PARAM_NAME } from './types'

const request = async (config: {
  backendUrl: string
  logger: ILogger
  guestUserId: UserId | null
}): Promise<Result<string, { token: string; endpoint: string }>> => {
  try {
    const url = new URL(ENDPOINT, ensureProtocol(config.backendUrl))

    if (config.guestUserId) {
      url.searchParams.set(GUEST_USER_ID_QUERY_PARAM_NAME, config.guestUserId)
    }

    const response = await fetch(url, { credentials: 'include' })

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

export const PowerSyncCredentialsClient = {
  request,
}
