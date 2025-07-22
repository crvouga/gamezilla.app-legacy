import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/primitives/box'
import { Translator } from '~/@/l18n/generated'
import { Button } from '~/@/ui/button'
import { DropDownConfig } from '~/@/ui/drop-down/drop-down-config'
import { Frag } from '~/@/vdom/primitives/frag'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { Typography } from '~/@/ui/typography'
import { h } from '~/@/vdom/h'
import { ScreenSize } from '../../screen/screen-size'
import { SurfaceLayout } from '../layout/surface-layout'

export type SurfaceUnsavedChangesProps = {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  title: TranslatedText
  body: TranslatedText
  open: boolean
  dropDown?: DropDownConfig
  onClose: () => void
  //
  saveText: TranslatedText
  onSave: () => void
  saveLoading?: boolean
  //
  discardText: TranslatedText
  onDiscard: () => void
  //
  cancelText: TranslatedText
  onCancel: () => void
}

export const SurfaceUnsavedChanges = (input: SurfaceUnsavedChangesProps) => {
  return h(SurfaceLayout, {
    ctx: input.ctx,
    id: 'unsaved-changes-drawer',
    ariaLabel: input.title,
    onClose: input.onClose,
    open: input.open,
    dropDown: input.dropDown,
    drawer: {
      position: 'bottom',
    },
    header: {
      render: () => h(SurfaceHeader, { ctx: input.ctx, title: input.title, onClose: input.onClose }),
    },
    body: {
      render: () =>
        h(Frag, {}, [
          h(Typography, {
            color: 'text-secondary',
            class: 'p-4 px-6',
            variant: 'body',
            text: input.body,
          }),
          h(Box, { class: 'flex w-full flex-col gap-4 p-4 px-6 pb-6' }, [
            h(Button, {
              class: 'w-full',
              text: input.saveText,
              variant: 'contained',
              color: 'primary',
              loading: input.saveLoading,
              onClick: input.onSave,
            }),
            h(Button, { class: 'w-full', text: input.discardText, onClick: input.onDiscard }),
            h(Box, { class: 'w-full' }),
            h(Button, { class: 'w-full', text: input.cancelText, onClick: input.onCancel }),
          ]),
        ]),
    },
  })
}
