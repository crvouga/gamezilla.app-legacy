import { NotAsked, Posix, RequestResponse, Result, TimeSpan, descend, isErr } from 'gamezilla-app/@/core'
import { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import { sendToServer, showErrSm } from 'gamezilla-app/app/@/client'
import { IconBox, Spinner, cn } from 'gamezilla-app/app/@/ui'
import { EmptyState } from 'gamezilla-app/app/@/ui/empty-state'
import type { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space'
import type { FlowPack } from '../pack'
import { initClient, MsgInCmdClient, type ClientModule, type ModelClient } from './pack-list.types'

const init = (input: { ctx: SpaceClientCtx; packs: ModelClient['packs'] }): ReturnType<ClientModule['update']> => {
  return {
    model: {
      request: NotAsked,
      packs: input.packs
    }
  }
}

const update: ClientModule['update'] = (input) => {
  return AppClientModule.andThen(
    { model: input.model },
    //
    (model) => updateList({ ...input, model })
    //
  )
}

const updateList: ClientModule['update'] = (input) => {
  switch (input.msgCmd?.c.t) {
    case 'load': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now)
        },
        msgCmd: [
          sendToServer({
            t: 'list-packs',
            input: {
              order: {
                lastUpdatedAt: 'asc'
              },
              pagination: {
                limit: 25,
                offset: 0
              },
              where: {
                // createdBy: ctx.currentUserId
              }
            }
          })
        ]
      }
    }
  }

  switch (input.msg?.t) {
    case 'user-observed-end-of-list': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.startedRequest(input.ctx.now)
        },
        msgCmd: [
          sendToServer({
            t: 'list-packs',
            input: {
              order: {
                lastUpdatedAt: 'asc'
              },
              pagination: {
                limit: 25,
                offset: 0
              },
              where: {
                // createdBy: ctx.currentUserId
              }
            }
          })
        ]
      }
    }

    case 'elapsed': {
      return {
        model: {
          ...input.model,
          request: RequestResponse.timePassed(input.model.request, input.ctx.now)
        }
      }
    }
  }

  switch (input.msgServer?.t) {
    case 'listed-packs': {
      const packs: FlowPack[] = input.msgServer.listed.t === 'ok' ? input.msgServer.listed.value.items : []

      const packsNew = packs.reduce((acc, puzzle) => {
        acc[puzzle.id] = puzzle
        return acc
      }, input.model.packs)

      return {
        model: {
          ...input.model,
          request: RequestResponse.response(
            input.model.request,
            input.ctx.now,
            Result.mapOk(input.msgServer.listed, () => null)
          ),
          packs: packsNew
        },
        msgCmd: isErr(input.msgServer.listed) ? showErrSm(input.ctx.t('app.something-went-wrong')) : []
      }
    }
    default: {
      break
    }
  }

  return { model: input.model }
}

const View: ClientModule['View'] = (input) => {
  const packs = Object.values(input.model.packs)
  const shouldShowLoadingState = RequestResponse.isRequesting(input.model.request)
  const shouldShowEmptyState = !shouldShowLoadingState && packs.length === 0

  return (
    <div className='relative flex w-full flex-1 flex-col gap-2 overflow-hidden'>
      <div className='relative flex max-h-full w-full flex-1 flex-col items-center overflow-x-hidden overflow-y-scroll border-t border-t-neutral-800'>
        {shouldShowEmptyState && (
          <EmptyState label={input.ctx.t('flow.no-packs')} renderIcon={(input) => <IconBox {...input} />} />
        )}

        {packs.sort(descend((pack) => Posix.toNumber(pack.lastUpdatedAt))).map((pack) => (
          <FlowPackListItem
            ctx={input.ctx}
            key={pack.id}
            pack={pack}
            onClick={() => input.emits?.clickedPackItem(pack)}
          />
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

const FlowPackListItem = ({
  pack,
  onClick,
  ctx
}: {
  ctx: {
    now: Posix
  }
  pack: FlowPack
  onClick: () => void
}) => {
  return (
    <button
      type='button'
      className='flex w-full max-w-full shrink-0 items-center justify-between gap-6 overflow-hidden border-b  px-4 py-6 text-left hover:bg-neutral-900 active:opacity-50'
      onClick={onClick}
    >
      {false && <IconBox className='h-9 w-9 shrink-0' />}
      <div className='flex flex-1 flex-col overflow-hidden'>
        <p className='overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold'>{pack.name}</p>
        <p className='text-sm text-neutral-300'>
          {TimeSpan.humanFriendlyString(Posix.diff(pack.lastUpdatedAt, ctx.now))}
        </p>
      </div>
      <p className='flex shrink-0 text-sm text-neutral-300'>{plural(pack.puzzleIds, 'puzzle', 'puzzles')}</p>
    </button>
  )
}

const plural = (arr: unknown[], singular: string, plural: string) =>
  `${arr.length} ${arr.length === 1 ? singular : plural}`

const subscriptions: ClientModule['subscriptions'] = (input) => {
  return RequestResponse.subscriptions(
    input.model.request,
    () => ({ t: 'elapsed' })
    //
  )
}

const load = (): MsgInCmdClient => {
  return {
    t: 'flow-pack-list',
    c: {
      t: 'load'
    }
  }
}

const didLoad = <TCmd,>(output: { msgCmd?: (MsgInCmdClient | TCmd)[] }): boolean => {
  return (
    output.msgCmd?.some(
      (cmd) => typeof cmd === 'object' && cmd && 't' in cmd && cmd.t === 'flow-pack-list' && cmd.c.t === 'load'
    ) ?? false
  )
}

export const PackListClient = {
  load,
  didLoad,
  initClient,
  init,
  update,
  View,
  subscriptions
}
