import { Pagination } from '~/@/query/query'
import { RequestResponse } from '~/@/request-response/request-response'
import { SpaceId } from '~/app/@/data/space-id'
import { Space } from '../core/space'

export type ModelFrontend = {
  listSpacesRequest: RequestResponse<string, null>
}

export type MsgFrontend = { t: 'list-spaces.clicked-space-card'; spaceId: SpaceId }

export type MsgToFrontend = {
  t: 'list-spaces.listed'
  spaces: Space.Model[]
}

export type MsgToBackend = {
  t: 'list-spaces'
  pagination: Pagination
  where?: {
    spaceId?: SpaceId
  }
}
