import { APP_SOUND, openProfile, playSound } from 'gamezilla-app/app/@/client'
import { Avatar, Button, Drawer, IconButton, IconUserGroup, Typography } from 'gamezilla-app/app/@/ui'
import { SpaceClientModule } from '../../@/architecture/space-client'
import { SpaceClientCtx } from '../../@/space-client-ctx'
import { ViewSpaceHostChip, ViewUsersInSpaceList, ViewYouChip } from '../../games/@/game/users-in-space-list'

const update: SpaceClientModule['update'] = (input) => {
  const { model } = input
  return SpaceClientModule.andThen(
    { model },
    (model) => updatePeopleModals({ ...input, model }),
    (model) => updateFromCmd({ ...input, model }),
    (model) => updateFromEvent({ ...input, model }),
    (model) => updateUserPreview({ ...input, model })
  )
}

const updateUserPreview: SpaceClientModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'clicked-preview-user-link': {
      if (!model.modalPreviewUserId) {
        return {
          model
        }
      }

      return {
        model,
        msgCmd: [playSound(APP_SOUND.navForwardMin), openProfile(model.modalPreviewUserId)]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updatePeopleModals: SpaceClientModule['update'] = ({ msg, model }) => {
  switch (msg?.t) {
    case 'closed-modal': {
      return {
        model: {
          ...model,
          modal: null
        },
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    case 'clicked-people-button': {
      return {
        model: {
          ...model,
          modal: 'users'
        },
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    case 'clicked-user': {
      return {
        model: {
          ...model,
          modalPreviewUserId: msg.userId,
          modal: 'user-preview'
        },
        msgCmd: [playSound(APP_SOUND.tap)]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

const updateFromCmd: SpaceClientModule['update'] = ({ msgCmd, model }) => {
  switch (msgCmd?.t) {
    case 'space/open-user-details': {
      return {
        model: {
          ...model,
          modalPreviewUserId: msgCmd.userId,
          modal: 'user-preview'
        }
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

const updateFromEvent: SpaceClientModule['update'] = ({ msgEvt, model }) => {
  switch (msgEvt?.t) {
    case 'routing/route-changed': {
      return {
        model: {
          ...model,
          modal: null
        }
      }
    }
    default: {
      return {
        model
      }
    }
  }
}

const View: SpaceClientModule['View'] = (input) => {
  if (!input.ctx.space || !input.ctx.currentUser) {
    return null
  }

  const spaceCtx: SpaceClientCtx = {
    ...input.ctx,
    currentUserId: input.ctx.currentUser.userId,
    currentUserRole: input.ctx.currentUser.role,
    space: input.ctx.space,
    currentUser: input.ctx.currentUser
  }

  const modalProfile = input.model.modalPreviewUserId ? input.ctx.profiles[input.model.modalPreviewUserId] : null
  return (
    <>
      <Drawer
        position='bottom'
        id='users'
        open={input.model.modal === 'users'}
        onClose={() => input.dispatch({ t: 'closed-modal' })}
      >
        <ViewUsersInSpaceList
          onOpenUserDetails={(userId) =>
            input.dispatch({
              t: 'clicked-user',
              userId
            })
          }
          ctx={spaceCtx}
        />
      </Drawer>
      <Drawer
        position='bottom'
        id='user-preview'
        open={input.model.modal === 'user-preview'}
        onClose={() =>
          input.dispatch({
            t: 'closed-modal'
          })
        }
      >
        <div>
          <button
            type='button'
            className='flex w-full flex-col items-center justify-center gap-2 p-4'
            onClick={() =>
              input.dispatch({
                t: 'clicked-preview-user-link'
              })
            }
          >
            <Avatar
              src={
                input.model.modalPreviewUserId
                  ? input.ctx.profiles[input.model.modalPreviewUserId]?.avatarUrl
                  : undefined
              }
              className='h-24 w-24'
            />
            {modalProfile && <Typography variant='title' text={input.ctx.t('username', modalProfile.username)} />}
            <div className='flex items-center gap-2'>
              {spaceCtx.space.hostId === input.model.modalPreviewUserId && <ViewSpaceHostChip ctx={input.ctx} />}
              {spaceCtx.currentUserId === input.model.modalPreviewUserId && <ViewYouChip ctx={input.ctx} />}
            </div>
          </button>

          <div className='w-full px-4 pb-8'>
            <Button
              onClick={() =>
                input.dispatch({
                  t: 'clicked-preview-user-link'
                })
              }
              className='w-full'
              text={input.ctx.t('spaces.see-profile')}
            />
          </div>
        </div>
      </Drawer>
    </>
  )
}

const ViewIconButton: SpaceClientModule['View'] = (input) => {
  if (!input.ctx.space || !input.ctx.currentUserId) {
    return null
  }

  const peopleCount = Object.keys(input.ctx.space.users).length

  return (
    <IconButton
      onClick={() =>
        input.dispatch({
          t: 'clicked-people-button'
        })
      }
      label={input.ctx.t('spaces.people-count', peopleCount)}
      renderIcon={(inputIcon) => <IconUserGroup {...inputIcon} />}
    />
  )
}

export const People = {
  update,
  ViewIconButton,
  View
}
