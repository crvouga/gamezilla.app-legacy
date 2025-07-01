import { descend } from '~/@/array/sorting'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { ClickableTransparent } from '~/@/ui/clickable'
import { EmptyState } from '~/@/ui/empty-state'
import { IconBox } from '~/@/ui/icon'
import { SpinnerBlock } from '~/@/ui/spinner'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { AddPacksCmd } from '../../frontend/add-packs-cmd.$msg'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import type { Pack } from '../pack'
import { PacksDbQuery } from '../pack-db/interface-query'
import { PackId } from '../pack-id'
import { GotPackLoaderMsg } from './got-pack-loader-msg.$msg'
import { ModelFrontend, MsgFrontend, initFrontend, type FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  if (GotPackLoaderMsg.is(input.msgIn)) {
    return update({ ...input, msgIn: null, msg: input.msgIn.c.msg })
  }

  switch (input.msg?.t) {
    case 'got-pack-db-packs': {
      return {
        model: {
          ...input.model,
          results: {
            ...input.model.results,
            [PacksDbQuery.toKey(input.msg.query)]: input.msg.packs.map((p) => p.id),
          },
        },
        msgCmd: [
          AddPacksCmd.init(
            input.msg.packs.reduce<{ [k: PackId]: Pack }>((acc, p) => ({ ...acc, [p.id]: p }), {}),
            input.msg,
          ),
        ],
      }
    }
  }

  return { model: input.model }
}

const watch = <TMsg>(ctx: FlowFrontendCtxBase, query: PacksDbQuery, map: (m: MsgFrontend) => TMsg): Sub<TMsg> => {
  return Sub.map(ctx.packDb.sub(query), (packs) => map({ t: 'got-pack-db-packs', query, packs }))
}

const ViewList = (input: {
  ctx: FlowFrontendCtxBase
  query: PacksDbQuery
  model: ModelFrontend
  onQueryChanged: (query: PacksDbQuery) => void
  onClick: (pack: Pack) => void
}) => {
  const queryKey = PacksDbQuery.toKey(input.query)
  const packIds = input.model.results[queryKey] ?? []
  const packs = packIds.flatMap((id) => (input.ctx.packs[id] ? [input.ctx.packs[id]] : []))

  const isLoading = !(queryKey in input.model.results)
  const isEmpty = !isLoading && packs.length === 0

  return h('div', { class: 'relative flex w-full flex-1 flex-col gap-2 overflow-hidden' }, [
    h(
      'div',
      {
        class:
          'relative flex max-h-full w-full flex-1 flex-col items-center overflow-x-hidden overflow-y-scroll border-t-neutral-800',
      },
      [
        isEmpty &&
          h(EmptyState, {
            label: input.ctx.t('game.numberlink.no-packs'),
            renderIcon: (input) => h(IconBox, input),
          }),

        ...packs.sort(descend((pack) => UnixMs.toNumber(pack.lastUpdatedAt))).map((pack) =>
          h(ViewPackListItem, {
            ctx: input.ctx,
            key: pack.id,
            pack: pack,
            onClick: () => input.onClick(pack),
          }),
        ),

        isLoading && h(SpinnerBlock, {}),
      ].filter(Boolean),
    ),
  ])
}

const ViewPackListItem = (input: { ctx: { now: UnixMs; t: Translator }; pack: Pack; onClick: () => void }) => {
  return h(
    ClickableTransparent,
    {
      class: 'flex w-full max-w-full shrink-0 items-center justify-between gap-6 overflow-hidden px-4 py-6 text-left',
      onClick: input.onClick,
    },
    [
      false && h(IconBox, { class: 'h-9 w-9 shrink-0' }),
      h('div', { class: 'flex flex-1 flex-col overflow-hidden' }, [
        h(Typography, { text: TranslatedText.of(input.pack.name), variant: 'body' }),
        h(Typography, { text: toListItemSecondaryText(input), variant: 'subtitle', color: 'text-secondary' }),
      ]),
      h(Typography, {
        text: input.ctx.t('game.numberlink.puzzle-count', input.pack.puzzleIds.length),
        variant: 'body',
        color: 'text-secondary',
        class: 'text-xs',
      }),
    ].filter(Boolean),
  )
}

const toListItemSecondaryText = (input: { ctx: { now: UnixMs; t: Translator }; pack: Pack }): TranslatedText => {
  return input.ctx.t(
    'app.last-updated-at',
    TimeSpan.humanFriendlyString(UnixMs.diff(input.pack.lastUpdatedAt, input.ctx.now), input.ctx.t),
  )
}

export const PackLoaderFrontend = {
  watch,
  initFrontend,
  update,
  ViewList,
}
