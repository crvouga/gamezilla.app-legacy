import { p } from '~/@/parser'
import { Err, isErr, Ok, Result } from '~/@/result'

const getPowersyncCredentials = async (input: {
  backendUrl: string
}): Promise<Result<string, { token: string; endpoint: string }>> => {
  try {
    console.log('getPowersyncCredentials', input)
    const credentialsUrl = new URL(input.backendUrl)
    credentialsUrl.pathname = '/powersync/credentials'
    const response = await fetch(credentialsUrl.toString(), {
      credentials: 'include',
    })
    const responseJson: unknown = await response.json()
    const parsed = p
      .obj({
        token: p.str,
        endpoint: p.str,
      })
      .parse(responseJson)
    if (isErr(parsed)) {
      return Err('Failed to parse response')
    }
    return Ok(parsed.value)
  } catch (e) {
    console.error('Failed to fetch credentials', e)
    return Err('Failed to fetch credentials')
  }
}

export const BackendAppRpc = {
  getPowersyncCredentials,
}
