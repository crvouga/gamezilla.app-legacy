import { descend } from '~/@/array/sorting'
import { RequestResponse } from '~/@/request-response/request-response'
import { NotAsked, Result, isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { Posix } from '~/@/time/posix'
import { TimeSpan } from '~/@/time/time-span'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { sendToBackend, showErrSm } from '~/app/@/frontend/cmd'
import { IconBox, Spinner, cn } from '~/app/@/ui'
import { EmptyState } from '~/app/@/ui/empty-state'
import type { Pack } from '../pack'
import { IPackDb } from '../pack-db'
import { PackId } from '../pack-id'
import {
  MsgFrontend,
  MsgInCmdFrontend,
  MsgOutCmdFrontend,
  MsgToBackend,
  initFrontend,
  type FrontendModule,
} from './types'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { Translator } from '~/@/l18n/generated'

const init = (): ReturnType<FrontendModule['update']> => {
  return {
    model: {
      request: NotAsked,
    },
  }
}

const update: FrontendModule['update'] = (input) => {
  return AppFrontendModule.andThen(
    { model: input.model },
    //
    (model) => updateList({ ...input, model }),
    //
  )
}

const updateList: FrontendModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'load': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now),
        },
        msgCmd: [
          sendToBackend({
            t: 'list-packs',
            input: {
              order: {
                lastUpdatedAt: 'asc',
              },
              pagination: {
                limit: 25,
                offset: 0,
              },
              where: {
                // createdBy: ctx.currentUserId
              },
            },
          }),
        ],
      }
    }
  }

  switch (input.msg?.t) {
    case 'user-observed-end-of-list': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now),
        },
        msgCmd: [
          sendToBackend({
            t: 'list-packs',
            input: {
              order: {
                lastUpdatedAt: 'asc',
              },
              pagination: {
                limit: 25,
                offset: 0,
              },
              where: {
                // createdBy: ctx.currentUserId
              },
            },
          }),
        ],
      }
    }

    case 'elapsed': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.timePassed(input.model.request, input.ctx.now),
        },
      }
    }
  }

  switch (input.msgBackend?.t) {
    case 'listed-packs': {
      const packs: Pack[] = input.msgBackend.listed.t === 'ok' ? input.msgBackend.listed.value.items : []

      const packsNew = packs.reduce<{ [id: PackId]: Pack }>((acc, p) => {
        acc[p.id] = p
        return acc
      }, {})

      const msgCmd: MsgOutCmdFrontend[] = [
        FlowFrontendCmdRoot.addPacks(packsNew, input.msgBackend),
        ...(isErr(input.msgBackend.listed)
          ? showErrSm<{
              MsgFrontend: MsgFrontend
              MsgToBackend: MsgToBackend
            }>(input.ctx.t('app.something-went-wrong'))
          : []),
      ]

      return {
        model: {
          ...input.model,
          request: RequestResponse.response(
            input.model.request,
            input.ctx.now,
            Result.mapOk(input.msgBackend.listed, () => null),
          ),
        },
        msgCmd,
      }
    }
    default: {
      break
    }
  }

  return { model: input.model }
}

const View: FrontendModule['View'] = (input) => {
  const packs = Object.values(input.ctx.packs)
  const shouldShowLoadingState = RequestResponse.isRequesting(input.model.request)
  const shouldShowEmptyState = !shouldShowLoadingState && packs.length === 0

  return (
    <div className='relative flex w-full flex-1 flex-col gap-2 overflow-hidden'>
      <div className='relative flex max-h-full w-full flex-1 flex-col items-center overflow-x-hidden overflow-y-scroll border-t-neutral-800'>
        {shouldShowEmptyState && (
          <EmptyState label={input.ctx.t('flow.no-packs')} renderIcon={(input) => <IconBox {...input} />} />
        )}

        {packs.sort(descend((pack) => Posix.toNumber(pack.lastUpdatedAt))).map((pack) => (
          <PackListItem ctx={input.ctx} key={pack.id} pack={pack} onClick={() => input.emits?.clickedPackItem(pack)} />
        ))}

        <div
          className={cn('flex h-32 w-full items-center justify-center py-6', !shouldShowLoadingState && 'opacity-0')}
        >
          <Spinner />
        </div>
      </div>

      <div className='absolute bottom-6 right-4 bg-black'>{input.slots?.fab?.(null)}</div>
    </div>
  )
}

const PackListItem = ({
  pack,
  onClick,
  ctx,
}: {
  ctx: {
    now: Posix
    t: Translator
  }
  pack: Pack
  onClick: () => void
}) => {
  return (
    <button
      type='button'
      className='clickable flex w-full max-w-full shrink-0 items-center justify-between gap-6 overflow-hidden px-4 py-6 text-left'
      onClick={onClick}
    >
      {false && <IconBox className='h-9 w-9 shrink-0' />}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <p className='overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold'>{pack.name}</p>
        <p className='text-secondary text-sm'>
          {TimeSpan.humanFriendlyString(Posix.diff(pack.lastUpdatedAt, ctx.now), ctx.t)}
        </p>
      </div>
      <p className='text-secondary flex shrink-0 text-sm'>{plural(pack.puzzleIds, 'puzzle', 'puzzles')}</p>
    </button>
  )
}

const plural = (arr: unknown[], singular: string, plural: string) =>
  `${arr.length} ${arr.length === 1 ? singular : plural}`

const subscriptions: FrontendModule['subscriptions'] = (input) => {
  return RequestResponse.subscriptions(
    input.model.request,
    () => ({ t: 'elapsed' }),
    //
  )
}

const load = (): MsgInCmdFrontend => {
  return {
    t: 'pack-list',
    c: {
      t: 'load',
    },
  }
}

const didLoad = <TCmd,>(output: { msgCmd?: (MsgInCmdFrontend | TCmd)[] }): boolean => {
  return (
    output.msgCmd?.some(
      (cmd) => typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'pack-list' && cmd.c.t === 'load',
    ) ?? false
  )
}

const watch = <T,>(_query: Parameters<IPackDb['list']>[0]): Sub<T> => {
  return Sub.None
}

export const PackListFrontend = {
  watch,
  load,
  didLoad,
  initFrontend,
  init,
  update,
  View,
  subscriptions,
}
