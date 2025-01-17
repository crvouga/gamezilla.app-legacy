import { Chip } from '~/app/@/ui/chip'
import { IconArrowDownShortWide } from '~/app/@/ui/icon/icon-arrow-down-short-wide'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import { QueryPuzzlesInput } from '../puzzle-db/query'

type Model = QueryPuzzlesInput

type Msg = { t: 'toggled-last-updated-chip' } | { t: 'toggled-created-at-chip' }

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
  }
}

const View = (input: { query: Model; ctx: FlowFrontendCtxRoot; onChange: (query: Model) => void }) => {
  const dispatch = (msg: Msg) => {
    const queryNew = update({ model: input.query, msg })
    input.onChange(queryNew)
  }
  return (
    <div className='flex w-full gap-2 px-4 py-4 pt-2'>
      <div className='flex-1'></div>

      {input.query.order.lastUpdatedAt && (
        <Chip
          size='sm'
          renderStartIcon={(input) => <IconArrowDownShortWide {...input} />}
          label={input.ctx.t('app.last-updated-desc')}
          onClick={() => dispatch({ t: 'toggled-last-updated-chip' })}
        />
      )}

      {input.query.order.createdAt && (
        <Chip
          size='sm'
          renderStartIcon={(input) => <IconArrowDownShortWide {...input} />}
          label={input.ctx.t('app.created-at-desc')}
          onClick={() => dispatch({ t: 'toggled-created-at-chip' })}
        />
      )}
    </div>
  )
}

export const QueryForm = {
  update,
  View,
}
