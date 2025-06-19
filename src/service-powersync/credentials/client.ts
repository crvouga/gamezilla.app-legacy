import { ILogger } from '~/@/logger'
import { Err, isErr, Ok, Result } from '~/@/result'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { ClientSessionIdHttp } from '~/@/wire/client-session-id-http'
import { UserId } from '~/app/@/data/user-id'
import { CredentialsResponseBodyOk, ENDPOINT, GUEST_USER_ID_QUERY_PARAM_NAME } from './types'

const request = async (config: {
  backendUrl: string
  logger: ILogger
  guestUserId: UserId | null
  clientSessionId: ClientSessionId
}): Promise<Result<string, { token: string; endpoint: string }>> => {
  try {
    const url = ClientSessionIdHttp.addToUrl(new URL(ENDPOINT, config.backendUrl), config.clientSessionId)

    if (config.guestUserId) {
      url.searchParams.set(GUEST_USER_ID_QUERY_PARAM_NAME, config.guestUserId)
    }

    const response = await fetch(url, {
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

export const PowerSyncCredentialsClient = {
  request,
}
