import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import type { UserId } from '~/app/@/data/user-id'
import { IconRobot, IconUsers, Typography } from '~/app/@/ui'
import {
  type SpaceClientCmd,
  type SpaceClientCmdTypes,
  exitGame,
  openUserDetails
} from '~/app/spaces/@/space-client/cmd'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { LayoutGameCoverArtHeader } from '../layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../users-in-space-list'

//
//
//
//
//
//

export type Msg =
  | {
      t: 'game-main-menu.clicked-open-user-details-button'
      userId: UserId
    }
  | {
      t: 'game-main-menu.clicked-exit-game-button'
    }

export const update = <TModel, TMsg, T extends SpaceClientCmdTypes>({
  msg,
  model
}: {
  model: TModel
  msg?: Msg | TMsg | null
}): {
  model: TModel
  msgCmd: SpaceClientCmd<T>[]
} => {
  if (typeof msg !== 'object' || !msg || !('t' in msg)) {
    return { model, msgCmd: [] }
  }

  switch (msg?.t) {
    case 'game-main-menu.clicked-exit-game-button': {
      return {
        model,
        msgCmd: [exitGame()]
      }
    }

    case 'game-main-menu.clicked-open-user-details-button': {
      return {
        model,
        msgCmd: [openUserDetails(msg.userId)]
      }
    }

    default: {
      return {
        model,
        msgCmd: []
      }
    }
  }
}

//
//
//
//
//
//

type MainMenuButton = {
  renderIcon: (input: { className: string }) => VDom
  title: TranslatedText
  description: TranslatedText
  onClick: () => void
}

export const View = ({
  title,
  renderCoverArt,
  buttons,
  ctx,
  dispatch,
  onBack
}: {
  onBack: () => void
  ctx: SpaceClientCtx
  title: TranslatedText
  dispatch: (msg: Msg) => void
  renderCoverArt: (input: { className: string; key: string }) => VDom
  buttons: MainMenuButton[]
}) => {
  if (ctx.currentUserId !== ctx.space.hostId) {
    return (
      <LayoutGameCoverArtHeader
        ctx={ctx}
        onBack={false}
        title={title}
        renderCoverArt={renderCoverArt}
        renderContent={() => (
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) =>
              dispatch({
                t: 'game-main-menu.clicked-open-user-details-button',
                userId
              })
            }
            ctx={ctx}
          />
        )}
      />
    )
  }

  return (
    <LayoutGameCoverArtHeader
      ctx={ctx}
      onBack={onBack}
      title={title}
      renderCoverArt={renderCoverArt}
      renderContent={() => (
        <div className='flex w-full flex-col p-4'>
          {buttons.map(({ renderIcon, title, description, onClick }, index) => (
            <button
              className='bg-paper mb-6 flex w-full items-center rounded p-6 active:opacity-70'
              onClick={onClick}
              key={`${index} ${title}`}
            >
              {renderIcon({
                className: 'aspect-square w-12 h-12 mr-4'
              })}
              <div className='flex flex-1 flex-col gap-1 text-left'>
                <Typography variant='title' text={title} />

                {description && <Typography variant='label' text={description} />}
              </div>
            </button>
          ))}
        </div>
      )}
    />
  )
}

export const buttons = {
  playFriend: (input: { onClick: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => <IconUsers {...input} />,
      title: input.ctx.t('game.play-friend-title'),
      description: input.ctx.t('game.play-friend-description')
    }
  },

  playComputer: (input: { onClick: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => <IconRobot {...input} />,
      title: input.ctx.t('game.play-computer-title'),
      description: input.ctx.t('game.play-computer-description')
    }
  }
}
