import { ServerCmd } from 'gamezilla-app/app/@/server'
import { ModelServer, MsgServer, MsgToClient, MsgToServer } from './update-username.types'
import { ProfileDb } from '../profile-db/profile-db'

export const update = async <TModel extends ModelServer>(input: {
  deps: {
    profileDb: ProfileDb
  }
  model: TModel
  msg: MsgServer | null
  msgClient: MsgToServer | null
}): Promise<{
  model: TModel
  msgCmd?: ServerCmd<MsgToClient>[]
}> => {
  switch (input.msgClient?.t) {
    case 'clicked-save': {
      return {
        model: input.model
      }
    }
  }
  return { model: input.model }
}
