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
import { FloatingLayout } from '../layout/floating-layout'
import { sx } from '~/@/vdom/style/sx'

export type FloatingUnsavedChangesProps = {
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

export const FloatingUnsavedChanges = (input: FloatingUnsavedChangesProps) => {
  return h(FloatingLayout, {
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
            style: sx({ padding: 4, paddingLeft: 6 }),
            variant: 'body',
            text: input.body,
          }),
          h(
            Box,
            {
              style: sx({
                flexDirection: 'col',
                width: 'full',
                gap: 4,
                padding: 4,
                paddingLeft: 6,
                paddingBottom: 6,
              }),
            },
            [
              h(Button, {
                width: 'full',
                text: input.saveText,
                variant: 'contained',
                color: 'primary',
                loading: input.saveLoading,
                onPress: input.onSave,
              }),
              h(Button, { width: 'full', text: input.discardText, onPress: input.onDiscard }),
              h(Box, { style: sx({ width: 'full' }) }),
              h(Button, { width: 'full', text: input.cancelText, onPress: input.onCancel }),
            ],
          ),
        ]),
    },
  })
}
