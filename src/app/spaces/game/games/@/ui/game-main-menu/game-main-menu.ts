import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Translator } from '~/@/l18n/generated'
import { isOk } from '~/@/result'
import { s } from '~/@/schema'
import { ClickablePaper } from '~/@/ui/clickable'
import { IconRobot, IconUsers } from '~/@/ui/icon'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
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

type MainMenuButton = {
  renderIcon: (input: { class: string; fill: string; stroke: string }) => VDom
  title: TranslatedText
  description: TranslatedText
  onPress: () => void
}

export const View = (props: {
  onBack: () => void
  ctx: SpaceFrontendCtx
  title: TranslatedText
  dispatch: (msg: Msg) => void
  renderCoverArt: (input: { style: Record<string, unknown> }) => VDom
  buttons: MainMenuButton[]
  dataTestId?: string
}) => {
  const isSpectating = props.ctx.currentUser.userId !== props.ctx.space.hostId

  if (isSpectating) {
    return h(ScreenLayoutHostSettingUpGame, {
      parentScreen: props.ctx.parentScreen,
      ctx: props.ctx,
      dataTestId: props.dataTestId,
      navBar: { title: props.title, back: { onPress: props.onBack } },
    })
  }

  return h(ScreenLayoutGameCoverArt, {
    id: 'game-main-menu',
    parentScreen: props.ctx.parentScreen,
    dataTestId: props.dataTestId,
    ctx: props.ctx,
    navBar: { title: props.title, back: { onPress: props.onBack } },
    renderCoverArt: props.renderCoverArt,
    renderBody: () =>
      h(Box, { class: 'flex w-full flex-col gap-6 px-6', role: 'menu' }, [
        ...props.buttons.map((button) =>
          h(ViewMainMenuButton, {
            key: `${button.title}${button.description}`,
            ...button,
          }),
        ),
      ]),
  })
}

const ViewMainMenuButton = (props: MainMenuButton) => {
  return h(
    ClickablePaper,
    {
      class: 'flex flex-row w-full items-center gap-4 rounded p-6',
      onPress: props.onPress,
      role: 'menuitem',
      'aria-label': props.title,
    },
    [
      props.renderIcon({ class: 'aspect-square w-12 h-12', fill: '#fff', stroke: 'none' }),
      h(Box, { class: 'flex flex-1 flex-col gap-1 text-left' }, [
        h(Typography, {
          variant: 'title',
          text: props.title,
          class: 'font-bold',
        }),
        props.description &&
          h(Typography, {
            variant: 'label',
            text: props.description,
            class: 'text-secondary',
          }),
      ]),
    ],
  )
}

export const buttons = {
  playFriend: (input: { onPress: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => h(IconUsers, input),
      title: input.ctx.t('game.play-friend-title'),
      description: input.ctx.t('game.play-friend-description'),
    }
  },

  playComputer: (input: { onPress: () => void; ctx: { t: Translator } }): MainMenuButton => {
    return {
      ...input,
      renderIcon: (input) => h(IconRobot, input),
      title: input.ctx.t('game.play-computer-title'),
      description: input.ctx.t('game.play-computer-description'),
    }
  },
}
