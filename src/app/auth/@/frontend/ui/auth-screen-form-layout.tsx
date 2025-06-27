import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import { Button } from '~/@/ui/button'
import { VDom } from '~/@/vdom/vdom'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'
import { AuthScreenHeader } from './auth-screen-header'
import { AuthScreenLayout } from './auth-screen-layout'

export const AuthScreenFormLayout = (input: {
  ctx: {
    t: Translator
    screenSize: ScreenSize
  }
  title: TranslatedText
  onBack: () => void
  renderInputs: () => VDom
  submitText: TranslatedText
  submitLoading: boolean
  submitDisabled: boolean
  onSubmit: () => void
  dataTestId: string
}) => {
  return (
    <AuthScreenLayout
      dataTestId={input.dataTestId}
      ctx={input.ctx}
      navBar={{
        back: {
          onClick: input.onBack,
        },
        title: input.title,
      }}
      center={false}
    >
      <AuthScreenHeader ctx={input.ctx} title={input.title} onBack={input.onBack} />
      <form
        className='flex w-full flex-col gap-16 pt-4'
        onSubmit={(e) => {
          e.preventDefault()
          input.onSubmit()
        }}
      >
        <div className='flex w-full flex-col gap-6'>{input.renderInputs()}</div>

        <Button
          color='primary'
          size='lg'
          className='w-full'
          variant='contained'
          type='submit'
          text={input.submitText}
          loading={input.submitLoading}
          disabled={input.submitDisabled}
        />
      </form>
    </AuthScreenLayout>
  )
}
