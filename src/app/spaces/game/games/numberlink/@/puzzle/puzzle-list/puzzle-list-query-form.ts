import { Chip } from '~/@/ui/chip'
import { Box } from '~/@/vdom/primitives/box'
import { IconArrowDownShortWide, IconUserCircle } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { UserId } from '~/app/@/data/user-id'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { PuzzleQuery } from '../puzzle-db/interface-query'
import { theme } from '~/@/ui/theme/theme'

type Model = PuzzleQuery

type Msg =
  | { t: 'toggled-last-updated-chip' }
  | { t: 'toggled-created-at-chip' }
  | { t: 'toggled-created-by-you'; userId: UserId }

const update = (input: { model: Model; msg: Msg }): Model => {
  switch (input.msg.t) {
    case 'toggled-last-updated-chip': {
      return {
        ...input.model,
        order: {
          lastUpdatedAt: undefined,
          createdAt: 'desc',
        },
      }
    }
    case 'toggled-created-at-chip': {
      return {
        ...input.model,
        order: {
          lastUpdatedAt: 'desc',
          createdAt: undefined,
        },
      }
    }
    case 'toggled-created-by-you': {
      return {
        ...input.model,
      }
    }
  }
}

const View = (input: { query: Model; ctx: FlowFrontendCtxBase; onChange: (query: Model) => void }) => {
  const dispatch = (msg: Msg) => {
    const queryNew = update({ model: input.query, msg })
    input.onChange(queryNew)
  }
  return h(
    Box,
    { style: theme({ flexDirection: 'row', width: 'full', gap: 2, padding: 4, pt: 2 }) },
    [
      input.query.where.createdBy?.equals === input.ctx.currentUser.userId &&
        h(Chip, {
          size: 'sm',
          renderStartIcon: (input) => h(IconUserCircle, input),
          label: input.ctx.t('app.created-by-you'),
        }),

      h(Box, { style: theme({ flex: 1 }) }),

      typeof input.query.order.lastUpdatedAt === 'string' &&
        h(Chip, {
          size: 'sm',
          renderStartIcon: (input) => h(IconArrowDownShortWide, input),
          label: input.ctx.t('app.last-updated-at-desc'),
          onPress: () => dispatch({ t: 'toggled-last-updated-chip' }),
        }),

      typeof input.query.order.createdAt === 'string' &&
        h(Chip, {
          size: 'sm',
          renderStartIcon: (input) => h(IconArrowDownShortWide, input),
          label: input.ctx.t('app.created-at-desc'),
          onPress: () => dispatch({ t: 'toggled-created-at-chip' }),
        }),
    ].filter(Boolean),
  )
}

export const PuzzleListQueryForm = {
  update,
  View,
}
