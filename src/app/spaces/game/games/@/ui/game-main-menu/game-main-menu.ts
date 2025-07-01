import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { isOk } from '~/@/result'
import { s } from '~/@/schema'
import { ClickablePaper } from '~/@/ui/clickable'
import { IconRobot, IconUsers } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { v } from '~/@/vdom/v'
import type { VDom } from '~/@/vdom/vdom'
import { UserId } from '~/app/@/data/user-id'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { ExitGameCmd } from '~/app/spaces/@/frontend/exit-game-cmd'
import { OpenUserDetailsCmd } from '~/app/spaces/@/frontend/open-user-details-cmd'
import { ScreenLayoutGameCoverArt } from '../screen-layout-game-cover-art'
import { ScreenLayoutHostSettingUpGame } from '../screen-layout-host-setting-up-game/screen-layout-host-setting-up-game'

export const Msg = s.or(
  s.obj({ t: s.l('game-main-menu.clicked-open-user-details-button'), userId: UserId }),
  s.obj({ t: s.l('game-main-menu.clicked-exit-game-button') }),
)
export type Msg = s.Infer<typeof Msg>

const isMsg = (m: unknown): m is Msg => isOk(Msg.parse(m))

export const update = <TModel, TMsg>({
  msg,
  model,
}: {
  model: TModel
  msg?: Msg | TMsg | null
}): {
  model: TModel
  msgOut: unknown[]
} => {
  if (!isMsg(msg)) return { model, msgOut: [] }

  switch (msg.t) {
    case 'game-main-menu.clicked-exit-game-button': {
      return { model, msgOut: [ExitGameCmd.init()] }
    }

    case 'game-main-menu.clicked-open-user-details-button': {
      return { model, msgOut: [OpenUserDetailsCmd.init(msg.userId)] }
    }

    default: {
      return { model, msgOut: [] }
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
  const isSpectating = props.ctx.currentUser.userId !== props.ctx.space.hostId

  if (isSpectating) {
    return v(ScreenLayoutHostSettingUpGame, {
      parentScreen: props.ctx.parentScreen,
      ctx: props.ctx,
      navBar: { title: props.title, back: { onClick: props.onBack } },
    })
  }

  return v(ScreenLayoutGameCoverArt, {
    id: 'game-main-menu',
    parentScreen: props.ctx.parentScreen,
    ctx: props.ctx,
    navBar: { title: props.title, back: { onClick: props.onBack } },
    renderCoverArt: props.renderCoverArt,
    renderBody: () =>
      v('div', { className: 'flex w-full flex-col gap-6 px-6' }, [
        ...props.buttons.map((button) =>
          v(ViewMainMenuButton, {
            key: `${button.title}${button.description}`,
            ...button,
          }),
        ),
      ]),
  })
}

const ViewMainMenuButton = (props: MainMenuButton) => {
  return v(ClickablePaper, { className: 'flex w-full items-center gap-4 rounded p-6', onClick: props.onClick }, [
    props.renderIcon({ className: 'aspect-square size-12' }),
    v('div', { className: 'flex flex-1 flex-col gap-1 text-left' }, [
      v(Typography, {
        variant: 'title',
        text: props.title,
        className: 'font-bold',
      }),
      props.description &&
        v(Typography, {
          variant: 'label',
          text: props.description,
          className: 'text-secondary',
        }),
    ]),
  ])
}

export const buttons = {
  playFriend: (input: { onClick: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => v(IconUsers, input),
      title: input.ctx.t('game.play-friend-title'),
      description: input.ctx.t('game.play-friend-description'),
    }
  },

  playComputer: (input: { onClick: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => v(IconRobot, input),
      title: input.ctx.t('game.play-computer-title'),
      description: input.ctx.t('game.play-computer-description'),
    }
  },
}
