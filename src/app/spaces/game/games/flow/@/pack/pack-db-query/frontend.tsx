import { descend } from '~/@/array/sorting'
import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { VDom } from '~/@/vdom/vdom'
import { IconBox, SpinnerBlock, Typography } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import type { Pack } from '../pack'
import { PacksDbQuery } from '../pack-db/query'
import { PackId } from '../pack-id'
import { ModelFrontend, MsgFrontend, MsgInCmdFrontend, initFrontend, type FrontendModule } from './types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'got-msg': {
      return update({
        ...input,
        msgCmd: null,
        msg: input.msgCmd.c.msg,
      })
    }
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
          FlowFrontendCmdRoot.addPacks(
            input.msg.packs.reduce<{ [k: PackId]: Pack }>((acc, p) => ({ ...acc, [p.id]: p }), {}),
            input.msg,
          ),
        ],
      }
    }
  }

  return { model: input.model }
}

const gotMsg = (msg: MsgFrontend): MsgInCmdFrontend => {
  return {
    t: 'pack-db-query',
    c: {
      t: 'got-msg',
      msg,
    },
  }
}

const watch = <TMsg,>(ctx: FlowFrontendCtxRoot, query: PacksDbQuery, map: (m: MsgFrontend) => TMsg): Sub<TMsg> => {
  return Sub.map(ctx.packDb.sub(query), (packs) => map({ t: 'got-pack-db-packs', query, packs }))
}

const ViewList = (input: {
  ctx: FlowFrontendCtxRoot
  query: PacksDbQuery
  model: ModelFrontend
  onQueryChanged: (query: PacksDbQuery) => void
  onClick: (pack: Pack) => void
  fab?: VDom
}) => {
  const queryKey = PacksDbQuery.toKey(input.query)
  const packIds = input.model.results[queryKey] ?? []
  const packs = packIds.flatMap((id) => (input.ctx.packs[id] ? [input.ctx.packs[id]] : []))

  const isLoading = !(queryKey in input.model.results)
  const isEmpty = !isLoading && packs.length === 0

  return (
    <div className='relative flex w-full flex-1 flex-col gap-2 overflow-hidden'>
      <div className='relative flex max-h-full w-full flex-1 flex-col items-center overflow-x-hidden overflow-y-scroll border-t-neutral-800'>
        {isEmpty && <EmptyState label={input.ctx.t('flow.no-packs')} renderIcon={(input) => <IconBox {...input} />} />}

        {packs.sort(descend((pack) => Posix.toNumber(pack.lastUpdatedAt))).map((pack) => (
          <ViewPackListItem ctx={input.ctx} key={pack.id} pack={pack} onClick={() => input.onClick(pack)} />
        ))}

        {isLoading && <SpinnerBlock />}
      </div>

      {input.fab && <div className='absolute bottom-6 right-4 bg-black'>{input.fab}</div>}
    </div>
  )
}

const ViewPackListItem = (input: { ctx: { now: Posix; t: Translator }; pack: Pack; onClick: () => void }) => {
  return (
    <button
      type='button'
      className='clickable flex w-full max-w-full shrink-0 items-center justify-between gap-6 overflow-hidden px-4 py-6 text-left'
      onClick={input.onClick}
    >
      {false && <IconBox className='h-9 w-9 shrink-0' />}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <Typography text={TranslatedText.of(input.pack.name)} variant='body' />
        <Typography text={toListItemSecondaryText(input)} variant='subtitle' color='text-secondary' />
      </div>
      <Typography
        text={input.ctx.t('flow.puzzle-count', input.pack.puzzleIds.length)}
        variant='body'
        color='text-secondary'
        className='text-xs'
      />
    </button>
  )
}

const toListItemSecondaryText = (input: { ctx: { now: Posix; t: Translator }; pack: Pack }): TranslatedText => {
  return input.ctx.t(
    'app.last-updated-at',
    TimeSpan.humanFriendlyString(Posix.diff(input.pack.lastUpdatedAt, input.ctx.now), input.ctx.t),
  )
}

export const PackDbQueryFrontend = {
  watch,
  gotMsg,
  initFrontend,
  update,
  ViewList,
}
