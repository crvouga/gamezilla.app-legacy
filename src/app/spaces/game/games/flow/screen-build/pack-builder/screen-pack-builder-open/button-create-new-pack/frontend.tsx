import { withEventId } from '~/@/event-sourced/event'
import { Loading, Ok } from '~/@/result'
import { IconPlus } from '~/@/ui/icon/icon-plus'
import { APP_SOUND } from '~/app/@/frontend/cmd'
import { PlaySoundCmd } from '~/app/@/frontend/play-sound-cmd'
import { ShowToastCmd } from '~/app/@/frontend/show-toast-cmd'
import { PostActionProps } from '~/app/@/ui/screen/layout/screen-layout-props'
import { Pack } from '../../../../@/pack/pack'
import { PackId } from '../../../../@/pack/pack-id'
import { PackName } from '../../../../@/pack/pack-name'
import type { FrontendModule } from '../../../types'

const update: FrontendModule['update'] = (input) => {
  switch (input.msg?.t) {
    case 'create-new-pack.clicked-create-button': {
      return {
        model: {
          ...input.model,
          packCreateNewRequest: Loading,
        },
        msgOut: [PlaySoundCmd.init(APP_SOUND.tap)],
        async eff(dispatch) {
          const userId = input.ctx.currentUser.userId
          const packNew: Pack = {
            isOfficial: false,
            createdAt: input.ctx.now,
            createdBy: userId,
            id: PackId.generate(),
            lastUpdatedAt: input.ctx.now,
            lastUpdatedBy: userId,
            name: await PackName.generate(),
            puzzleIds: [],
          }

          const created = await input.ctx.packDb.put(packNew)

          dispatch({ t: 'create-new-pack.db-put-pack', created, userId })
        },
      }
    }
    case 'create-new-pack.db-put-pack': {
      return {
        model: {
          ...input.model,
          packCreateNewRequest: Ok(null),
        },
        msgSpace: [withEventId({ ...input.msg, t: 'create-new-pack.user-created-pack' })],
        msgOut: [PlaySoundCmd.init(APP_SOUND.refreshFeed), ShowToastCmd.init(input.ctx.t('flow.pack-created'))],
      }
    }
  }

  return { model: input.model }
}

// const ViewCreateFab: FrontendModule['View'] = (input) => {
//   return (
//     <Button
//       rounded
//       text={input.ctx.t('flow.create-pack')}
//       variant='contained'
//       color='primary'
//       loading={input.model.packCreateNewRequest.t === 'loading'}
//       iconStart={(iconInput) => <IconPlus {...iconInput} />}
//       onClick={() =>
//         input.dispatch({
//           t: 'create-new-pack.clicked-create-button',
//         })
//       }
//     />
//   )
// }

const viewCreateAction = (input: Parameters<FrontendModule['View']>[0]): PostActionProps => {
  return {
    onSubmit: () =>
      input.dispatch({
        t: 'create-new-pack.clicked-create-button',
      }),
    submitText: input.ctx.t('flow.create-pack'),
    submitLoading: input.model.packCreateNewRequest.t === 'loading',
    submitDisabled: input.model.packCreateNewRequest.t === 'loading',
    submitIcon: (iconInput) => <IconPlus {...iconInput} />,
  }
}

export const PackCreateNewFrontend = {
  viewCreateAction,
  update,
}
