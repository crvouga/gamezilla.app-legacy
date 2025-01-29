import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { UserId } from '~/app/@/data/user-id'
import { IconRobot, IconUsers, Typography } from '~/@/ui'
import {
  type SpaceFrontendCmd,
  type SpaceFrontendCmdTypes,
  exitGame,
  openUserDetails,
} from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ScreenLayoutGameCoverArt } from '../layout-game-cover-art-header'
import { ViewUsersInSpaceList } from '../users-in-space-list'
import { p } from '~/@/parser'
import { isOk } from '~/@/result'

export const Msg = p.or(
  p.obj({ t: p.l('game-main-menu.clicked-open-user-details-button'), userId: UserId }),
  p.obj({ t: p.l('game-main-menu.clicked-exit-game-button') }),
)
export type Msg = p.Infer<typeof Msg>

const isMsg = (m: unknown): m is Msg => isOk(Msg.parse(m))

export const update = <TModel, TMsg, T extends SpaceFrontendCmdTypes>({
  msg,
  model,
}: {
  model: TModel
  msg?: Msg | TMsg | null
}): {
  model: TModel
  msgCmd: SpaceFrontendCmd<T>[]
} => {
  if (!isMsg(msg)) return { model, msgCmd: [] }

  switch (msg.t) {
    case 'game-main-menu.clicked-exit-game-button': {
      return { model, msgCmd: [exitGame()] }
    }

    case 'game-main-menu.clicked-open-user-details-button': {
      return { model, msgCmd: [openUserDetails(msg.userId)] }
    }

    default: {
      return { model, msgCmd: [] }
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

export const View = (props: {
  onBack: () => void
  ctx: SpaceFrontendCtx
  title: TranslatedText
  dispatch: (msg: Msg) => void
  renderCoverArt: (input: { className: string }) => VDom
  buttons: MainMenuButton[]
}) => {
  const isSpectating = props.ctx.currentUserId !== props.ctx.space.hostId

  if (isSpectating) {
    return (
      <ScreenLayoutGameCoverArt
        ctx={props.ctx}
        navBar={{
          title: props.title,
        }}
        renderCoverArt={props.renderCoverArt}
        renderContent={() => (
          <ViewUsersInSpaceList
            onOpenUserDetails={(userId) =>
              props.dispatch({ t: 'game-main-menu.clicked-open-user-details-button', userId })
            }
            ctx={props.ctx}
          />
        )}
      />
    )
  }

  return (
    <ScreenLayoutGameCoverArt
      ctx={props.ctx}
      navBar={{ title: props.title, onBack: props.onBack }}
      renderCoverArt={props.renderCoverArt}
      renderContent={() => (
        <div className='flex w-full flex-col gap-6'>
          {props.buttons.map((button) => (
            <MainMenuButtonView key={`${button.title}${button.description}`} {...button} />
          ))}
        </div>
      )}
    />
  )
}

const MainMenuButtonView = (props: MainMenuButton) => {
  return (
    <button className='bg-paper clickable flex w-full items-center gap-4 rounded p-6' onClick={props.onClick}>
      {props.renderIcon({ className: 'aspect-square size-12' })}
      <div className='flex flex-1 flex-col gap-1 text-left'>
        <Typography variant='title' text={props.title} />
        {props.description && <Typography variant='label' text={props.description} />}
      </div>
    </button>
  )
}

export const buttons = {
  playFriend: (input: { onClick: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => <IconUsers {...input} />,
      title: input.ctx.t('game.play-friend-title'),
      description: input.ctx.t('game.play-friend-description'),
    }
  },

  playComputer: (input: { onClick: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => <IconRobot {...input} />,
      title: input.ctx.t('game.play-computer-title'),
      description: input.ctx.t('game.play-computer-description'),
    }
  },
}
