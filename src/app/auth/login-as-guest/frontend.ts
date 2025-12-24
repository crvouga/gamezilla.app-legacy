import { Eff } from '~/@/eff'
import { Err, isErr, isOk, Loading, NotAsked, Ok, Result, unwrapOr } from '~/@/result'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { Button } from '~/@/ui/button'
import { IconUserCircle } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { UserAccount } from '~/app/@/data/user-account'
import { UserId } from '~/app/@/data/user-id'
import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { playSound } from '~/app/@/frontend/sound-cmd'
import { showToast } from '~/app/@/frontend/toaster-cmd'
import { replaceScreen } from '~/app/frontend/current-screen/current-screen-cmd'
import { AuthFrontendCtx } from '../@/frontend/ctx'
import { GuestSessionMapping } from '../@/guest-session-mapping/guest-session-mapping'
import { GuestSessionMappingId } from '../@/guest-session-mapping/guest-session-mapping-id'
import { UserSession } from '../@/user-session/user-session'
import { UserSessionId } from '../@/user-session/user-session-id'
import { ModelFrontend, MsgFrontend } from './types'

export const init = (_input: {}): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      loginAsGuest_request: NotAsked,
    },
  }
}

export const update = (input: {
  ctx: AuthFrontendCtx
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'loginAsGuest_clickedContinueAsGuestButton': {
      return {
        model: {
          ...input.model,
          loginAsGuest_request: Loading,
        },
        eff: Eff.batch([
          playSound(APP_SOUND.tap),
          async (dispatch) => {
            const result = await continueAsGuest({
              ctx: input.ctx,
              clientSessionId: input.ctx.clientSessionId,
              now: input.ctx.now,
            })
            dispatch({ n: 'loginAsGuest', t: 'loginAsGuest_continueAsGuestResult', result })
          },
        ]),
      }
    }
    case 'loginAsGuest_continueAsGuestResult': {
      return {
        model: {
          ...input.model,
          loginAsGuest_request: input.msg.result,
        },
        eff: isOk(input.msg.result)
          ? Eff.batch([
              playSound(APP_SOUND.celebration),
              replaceScreen({ n: 'spaces', t: 'spaces_list' }, true),
              showToast(input.ctx.t('auth.logged-in-as-guest'), 'info', TimeSpan.seconds(4)),
            ])
          : undefined,
      }
    }
  }
}

const continueAsGuest = async (input: {
  ctx: AuthFrontendCtx
  clientSessionId: ClientSessionId
  now: UnixMs
}): Promise<Result<string, UserAccount>> => {
  const existingGuestUserId = await input.ctx.guestSessionMappingDb.findUserIdByClientSessionId(input.clientSessionId)

  if (isErr(existingGuestUserId)) return existingGuestUserId

  const existingGuestAccount = existingGuestUserId.value
    ? unwrapOr(
        await input.ctx.userAccountDb.query({
          where: { op: 'and', clauses: [{ op: '=', column: 'userId', value: existingGuestUserId.value }] },
          limit: 1,
          offset: 0,
        }),
        null,
      )
    : null

  const newGuestAccount: UserAccount = {
    role: 'guest',
    userId: UserId.generate(),
    createdAt: input.now,
    phoneNumber: null,
  }

  const guestAccount: UserAccount = existingGuestAccount?.entities.items[0] ?? newGuestAccount

  const guestSessionMappingNew: GuestSessionMapping = {
    id: GuestSessionMappingId.generate(),
    clientSessionId: input.clientSessionId,
    guestUserId: guestAccount.userId,
    sessionId: null,
  }

  const inserted = await input.ctx.guestSessionMappingDb.upsert(guestSessionMappingNew)

  if (isErr(inserted)) return inserted

  const insertedAccount = existingGuestAccount
    ? Ok(null)
    : await input.ctx.userAccountDb.upsert({ entities: [guestAccount] })

  if (isErr(insertedAccount)) return Err(insertedAccount.error.message)

  const userSessionNew: UserSession = {
    userSessionId: UserSessionId.generate(),
    sessionId: null,
    clientSessionId: input.clientSessionId,
    userId: guestAccount.userId,
    createdAt: input.now,
    endedAt: null,
  }

  const insertedSession = await input.ctx.userSessionDb.upsert({ entities: [userSessionNew] })

  if (isErr(insertedSession)) return Err(insertedSession.error.message)

  return Ok(guestAccount)
}

export const TEST_ID_CONTINUE_AS_GUEST_BUTTON = 'auth/continue-as-guest-button'

export const ViewButton = (input: {
  ctx: AuthFrontendCtx
  model: ModelFrontend
  dispatch: (msg: MsgFrontend) => void
}) => {
  return h(Button, {
    onPress: () => input.dispatch({ n: 'loginAsGuest', t: 'loginAsGuest_clickedContinueAsGuestButton' }),
    renderIconStart: (iconInput) => h(IconUserCircle, iconInput),
    text: input.ctx.t('auth.continue-as-guest'),
    width: 'full',
  })
}
