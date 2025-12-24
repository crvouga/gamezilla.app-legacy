import { SpaceId } from '~/app/@/data/space-id'
import { GotQueryCacheMsg } from '~/app/frontend/query-cache/got-query-cache-msg.$msg'

export type Msg = { t: 'clickedSpaceCard'; spaceId: SpaceId } | { t: 'listSpaces_gotMsgSpace'; c: GotQueryCacheMsg }
