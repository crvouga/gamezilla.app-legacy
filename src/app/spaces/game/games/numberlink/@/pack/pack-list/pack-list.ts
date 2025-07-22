import { descend } from '~/@/array/sorting'
import { Box } from '~/@/vdom/primitives/box'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { ClickableTransparent } from '~/@/ui/clickable'
import { EmptyState } from '~/@/ui/empty-state'
import { IconBox } from '~/@/ui/icon'
import { SpinnerBlock } from '~/@/ui/spinner-block'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import type { Pack } from '../pack'
import { PackDbQueryCache } from '../pack-db-query-cache'
import { PackQuery } from '../pack-db/interface-query'

const View = (input: {
  ctx: FlowFrontendCtxBase
  query: PackQuery
  onQueryChanged: (query: PackQuery) => void
  onClick: (pack: Pack) => void
}) => {
  const packs = PackDbQueryCache.read(input.ctx, input.query)
  const isLoading = PackDbQueryCache.isLoading(input.ctx, input.query)
  const isEmpty = PackDbQueryCache.isEmpty(input.ctx, input.query)

  return h(Box, { class: 'relative flex w-full flex-1 flex-col gap-2 overflow-hidden' }, [
    h(
      Box,
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
      h(Box, { class: 'flex flex-1 flex-col overflow-hidden' }, [
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

export const PackList = {
  View,
}
