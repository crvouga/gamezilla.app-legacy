import { IHttpClient } from '~/@/http-client'
import { ILogger } from '~/@/logger'
import { Err, isErr, Ok } from '~/@/result'
import { Url } from '~/@/url/url'
import { ServerRegistryRecord } from '../server-registry-record'
import { IServerRegistryRecordDb } from './interface'

export type ImplSrcUrl = {
  t: 'src-url'
  httpClient: IHttpClient
  logger: ILogger
  srcUrl: Url
}

const init = (self: ImplSrcUrl): IServerRegistryRecordDb => {
  return {
    async get() {
      const req = new Request(self.srcUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      const res = await self.httpClient.send(req)

      if (!res.ok) return Err(`Failed to load server registry: ${res.statusText}`)

      const data = await res.json()

      const parsed = ServerRegistryRecord.schema.parse(data)

      if (isErr(parsed)) return Err(`Failed to load server registry: ${parsed.error}`)

      return Ok(parsed.value)
    },
    async insert() {
      self.logger.warn('put is not supported for src-url')
      return Ok(null)
    },
    async cleanUp() {
      self.logger.warn('cleanUp is not supported for src-url')
      return Ok(null)
    },
  }
}

export const ImplSrcUrl = {
  init,
}
