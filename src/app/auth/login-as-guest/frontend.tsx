import { isErr, Loading, NotAsked, Ok, Result, unwrapOr } from '~/@/result'
import { Posix } from '~/@/time/posix'
import { Button } from '~/@/ui/button'
import { IconUserCircle } from '~/@/ui/icon/icon-user-circle'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { GuestSessionMapping } from '../@/guest-session-mapping/guest-session-mapping'
import { GuestSessionMappingId } from '../@/guest-session-mapping/guest-session-mapping-id'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionId } from '../@/user-session/user-session-id'
import type { FrontendModule, ModelFrontend } from './types'

const init: ModelFrontend = {
  request: NotAsked,
}

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'clicked-continue-as-guest-button': {
      return {
        model: {
          ...input.model,
          request: Loading,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const result = await continueAsGuest({
            ctx: input.ctx,
            clientSessionId: input.ctx.clientSessionId,
            now: input.ctx.now,
          })
          dispatch({ t: 'continue-as-guest-result', result })
        },
      }
    }
    case 'continue-as-guest-result': {
      return {
        model: {
          ...input.model,
          request: input.msg.result,
        },
      }
    }
  }

  return {
    model: input.model,
  }
}

const continueAsGuest = async (input: {
  ctx: AuthFrontendCtx
  clientSessionId: ClientSessionId
  now: Posix
}): Promise<Result<string, UserAccount>> => {
  const existingGuestUserId = await input.ctx.guestSessionMappingDb.findUserIdByClientSessionId(input.clientSessionId)

  if (isErr(existingGuestUserId)) return existingGuestUserId

  const existingGuestAccount = unwrapOr(
    await input.ctx.userAccountDb.findOneByUserId({ userId: existingGuestUserId.value }),
    null,
  )

  const newGuestAccount: UserAccount = {
    role: 'guest',
    userId: UserId.generate(),
    createdAt: input.now,
    phoneNumber: null,
  }

  const guestAccount: UserAccount = existingGuestAccount ?? newGuestAccount

  const guestSessionMappingNew: GuestSessionMapping = {
    id: GuestSessionMappingId.generate(),
    clientSessionId: input.clientSessionId,
    guestUserId: guestAccount.userId,
    sessionId: null,
  }

  const inserted = await input.ctx.guestSessionMappingDb.insert(guestSessionMappingNew)

  if (isErr(inserted)) return inserted

  const insertedAccount = existingGuestAccount ? Ok(null) : await input.ctx.userAccountDb.insert(guestAccount)

  if (isErr(insertedAccount)) return insertedAccount

  const userSessionNew: UserSession = {
    userSessionId: UserSessionId.generate(),
    sessionId: null,
    clientSessionId: input.clientSessionId,
    userId: guestAccount.userId,
    createdAt: input.now,
    endedAt: null,
  }

  const insertedSession = await input.ctx.userSessionDb.insert(userSessionNew)

  if (isErr(insertedSession)) return insertedSession

  return Ok(guestAccount)
}

const ViewButton: FrontendModule['View'] = (input) => {
  return (
    <Button
      onClick={() => input.dispatch({ t: 'clicked-continue-as-guest-button' })}
      renderIconStart={(iconInput) => <IconUserCircle {...iconInput} />}
      text={input.ctx.t('auth.continue-as-guest')}
    />
  )
}

export const ContinueAsGuestFrontend = {
  init,
  update,
  ViewButton,
}
