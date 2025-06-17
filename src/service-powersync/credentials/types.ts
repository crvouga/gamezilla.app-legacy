import { s } from '~/@/schema'

export const ENDPOINT = '/powersync/credentials'

export const CredentialsResponseBodyOk = s.obj({
  token: s.str(),
  endpoint: s.str(),
})

export type CredentialsResponseBodyOk = s.Infer<typeof CredentialsResponseBodyOk>

const CredentialsResponseBodyErr = s.obj({
  message: s.str(),
})

export type CredentialsResponseBodyErr = s.Infer<typeof CredentialsResponseBodyErr>
