import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Button, Typography } from '~/@/ui'
import { Frag } from '~/@/ui/frag'
import { SurfaceHeader } from '~/@/ui/surface/surface-header'
import { ScreenSize } from '../../screen/screen-size'
import { SurfaceLayout } from '../layout/surface-layout'
import { SurfaceLayoutDropDownProps } from '../layout/surface-layout-props'

export type SurfaceUnsavedChangesProps = {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  title: TranslatedText
  body: TranslatedText
  open: boolean
  dropDown?: SurfaceLayoutDropDownProps
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
  return (
    <SurfaceLayout
      ctx={input.ctx}
      id='unsaved-changes-drawer'
      ariaLabel={input.title}
      onClose={input.onClose}
      open={input.open}
      dropDown={input.dropDown}
      drawer={{
        position: 'bottom',
      }}
      header={{
        render: () => <SurfaceHeader ctx={input.ctx} title={input.title} onClose={input.onClose} />,
      }}
      body={{
        render: () => (
          <Frag>
            <Typography className='text-secondary p-4 px-6' variant='body' text={input.body} />
            <div className='flex w-full flex-col gap-4 p-4 px-6 pb-6'>
              <Button
                className='w-full'
                text={input.saveText}
                variant='contained'
                color='primary'
                loading={input.saveLoading}
                onClick={input.onSave}
              />
              <Button className='w-full' text={input.discardText} onClick={input.onDiscard} />
              <div className='w-full' />
              <Button className='w-full' text={input.cancelText} onClick={input.onCancel} />
            </div>
          </Frag>
        ),
      }}
    />
  )
}
