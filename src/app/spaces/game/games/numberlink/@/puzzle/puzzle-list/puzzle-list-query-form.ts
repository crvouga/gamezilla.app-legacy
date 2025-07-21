import { Chip } from '~/@/ui/chip'
import { IconArrowDownShortWide, IconUserCircle } from '~/@/ui/icon'
import { h } from '~/@/vdom/h'
import { UserId } from '~/app/@/data/user-id'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { PuzzleQuery } from '../puzzle-db/interface-query'

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
    'div',
    { class: 'flex w-full gap-2 px-4 py-4 pt-2' },
    [
      input.query.where.createdBy?.equals === input.ctx.currentUser.userId &&
        h(Chip, {
          size: 'sm',
          renderStartIcon: (input) => h(IconUserCircle, input),
          label: input.ctx.t('app.created-by-you'),
        }),

      h('div', { class: 'flex-1' }),

      input.query.order.lastUpdatedAt &&
        h(Chip, {
          size: 'sm',
          renderStartIcon: (input) => h(IconArrowDownShortWide, input),
          label: input.ctx.t('app.last-updated-at-desc'),
          onClick: () => dispatch({ t: 'toggled-last-updated-chip' }),
        }),

      input.query.order.createdAt &&
        h(Chip, {
          size: 'sm',
          renderStartIcon: (input) => h(IconArrowDownShortWide, input),
          label: input.ctx.t('app.created-at-desc'),
          onClick: () => dispatch({ t: 'toggled-created-at-chip' }),
        }),
    ].filter(Boolean),
  )
}

export const QueryForm = {
  update,
  View,
}
