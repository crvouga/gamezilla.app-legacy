import { APP_SOUND } from '~/app/@/frontend/app-sound'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd.$msg'
import { ScreenLayout } from '~/app/@/ui/screen/layout/screen-layout'
import { GameFrontendModule } from '~/app/spaces/game/games/@/architecture/game-frontend-v2'
import { FlowFrontendCtx } from '../../../@/frontend/ctx'
import { PuzzleQuery } from '../../../@/puzzle/puzzle-db/interface-query'
import { PuzzleLoaderFrontend } from '../../../@/puzzle/puzzle-loader/frontend'
import { GotPuzzleLoaderMsg } from '../../../@/puzzle/puzzle-loader/got-puzzle-loader-msg.$msg'
import type { FrontendModule, ModelSpace, MsgFrontend } from '../../types'
import { CreateNewPuzzleFrontend } from './button-create-new-puzzle/frontend'

const update: FrontendModule['update'] = (input) => {
  return GameFrontendModule.andThen(
    { model: input.model },
    (model) => CreateNewPuzzleFrontend.update({ ...input, model }),
    (model) => updateMain({ ...input, model }),
  )
}

const updateMain: FrontendModule['update'] = (input) => {
  switch (input.msgSpace?.t) {
    case 'screen-puzzle-builder-open.clicked-puzzle-db-query-item': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.navForwardMin)] }
    }
    case 'screen-puzzle-builder-open.puzzle-db-query-query-changed': {
      return { model: input.model, msgOut: [PlaySoundCmd.init(APP_SOUND.tap)] }
    }
  }

  return { model: input.model }
}

const toPuzzleQuery = (input: { ctx: FlowFrontendCtx; modelSpace: ModelSpace }): PuzzleQuery => {
  return (
    input.modelSpace.screenPuzzleBuilderOpen?.query ?? {
      order: {
        lastUpdatedAt: 'desc',
      },
      pagination: {
        offset: 0,
        limit: 100,
      },
      where: {
        createdBy: {
          equals: input.ctx.currentUser.userId,
        },
      },
    }
  )
}

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  const query = toPuzzleQuery(input)
  return PuzzleLoaderFrontend.watch(
    input.ctx,
    query,
    (c): MsgFrontend => ({ t: 'got-msg-out', c: GotPuzzleLoaderMsg.init(c) }),
  )
}

const View: FrontendModule['View'] = (input) => {
  const query = toPuzzleQuery(input)
  return (
    <ScreenLayout
      parentScreen={input.ctx.parentScreen}
      id='screen-puzzle-builder-open'
      ctx={input.ctx}
      navBar={{
        title: input.ctx.t('game.numberlink.puzzle-builder'),
        back: {
          onClick: () =>
            input.dispatch({
              t: 'got-msg-space',
              c: { t: 'user-clicked-back-button', userId: input.ctx.currentUser.userId },
            }),
        },
      }}
      postAction={CreateNewPuzzleFrontend.viewCreateAction(input)}
      renderBody={() => (
        <PuzzleLoaderFrontend.ViewList
          ctx={input.ctx}
          model={input.ctx.puzzleLoader}
          query={query}
          onQueryChanged={(query) => {
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'screen-puzzle-builder-open.puzzle-db-query-query-changed',
                query,
                userId: input.ctx.currentUser.userId,
              },
            })
          }}
          onItemClick={(puzzle) =>
            input.dispatch({
              t: 'got-msg-space',
              c: {
                t: 'screen-puzzle-builder-open.clicked-puzzle-db-query-item',
                puzzle,
                userId: input.ctx.currentUser.userId,
              },
            })
          }
        />
      )}
    />
  )
}

export const ScreenPuzzleBuilderOpenFrontend = {
  update,
  View,
  subscriptions,
}
