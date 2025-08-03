import { descend } from '~/@/array/sorting'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { TimeSpan } from '~/@/time/time-span'
import { UnixMs } from '~/@/time/unix-ms'
import { EmptyState } from '~/@/ui/empty-state'
import { IconBox } from '~/@/ui/icon'
import { SpinnerBlock } from '~/@/ui/spinner-block'
import { theme } from '~/@/ui/theme/theme'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { Box } from '~/@/vdom/primitives/box'
import { Pressable } from '~/@/vdom/primitives/pressable'
import { ScrollBox } from '~/@/vdom/primitives/scroll-box'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import type { Pack } from '../pack'
import { PackDbQueryCache } from '../pack-db-query-cache'
import { PackQuery } from '../pack-db/interface-query'

const View = (input: {
  ctx: FlowFrontendCtxBase
  query: PackQuery
  onQueryChanged: (query: PackQuery) => void
  onPress: (pack: Pack) => void
}) => {
  const packs = PackDbQueryCache.read(input.ctx, input.query)
  const isLoading = PackDbQueryCache.isLoading(input.ctx, input.query)
  const isEmpty = PackDbQueryCache.isEmpty(input.ctx, input.query)

  return h(
    ScrollBox,
    {
      style: theme({ flexDirection: 'col', gap: 0, overflow: 'hidden' }),
      contentContainerStyle: {
        rowGap: 0,
      },
    },
    [
      isEmpty &&
        h(EmptyState, {
          label: input.ctx.t('game.numberlink.no-packs'),
          renderIcon: (input) => h(IconBox, input),
        }),

      ...packs.sort(descend((pack) => UnixMs.toNumber(pack.lastUpdatedAt))).map((pack) =>
        h(ViewPackMenuItem, {
          ctx: input.ctx,
          key: pack.id,
          pack: pack,
          onPress: () => input.onPress(pack),
        }),
      ),

      isLoading && h(SpinnerBlock, {}),
    ].filter(Boolean),
  )
}

const ViewPackMenuItem = (input: { ctx: { now: UnixMs; t: Translator }; pack: Pack; onPress: () => void }) => {
  return h(
    Pressable,
    {
      onPress: input.onPress,
      style: theme({
        flexDirection: 'row',
        width: 'full',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        overflow: 'hidden',
        px: 4,
        textAlign: 'left',
        height: 20,
      }),
      role: 'menuitem',
    },
    [
      false && h(IconBox, { style: theme({ flexShrink: 0, size: 9 }) }),
      h(
        Box,
        {
          style: theme({
            flex: 1,
            flexDirection: 'col',
            overflow: 'hidden',
          }),
        },
        [
          h(Typography, {
            text: TranslatedText.of(input.pack.name),
            variant: 'body',
          }),
          h(Typography, {
            text: toMenuItemSecondaryText(input),
            variant: 'subtitle',
            color: 'text-secondary',
          }),
        ],
      ),
      h(Typography, {
        text: input.ctx.t('game.numberlink.puzzle-count', input.pack.puzzleIds.length),
        variant: 'body',
        color: 'text-secondary',
        style: theme({ textSize: 'xs' }),
      }),
    ].filter(Boolean),
  )
}

const toMenuItemSecondaryText = (input: { ctx: { now: UnixMs; t: Translator }; pack: Pack }): TranslatedText => {
  return input.ctx.t(
    'app.last-updated-at',
    TimeSpan.humanFriendlyString(UnixMs.diff(input.pack.lastUpdatedAt, input.ctx.now), input.ctx.t),
  )
}

export const PackList = {
  View,
}
