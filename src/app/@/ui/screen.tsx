import { VDomChildren } from '~/@/vdom/vdom'
import { BottomButtonInput, BottomButtons } from './bottom-buttons'
import { TranslatedText } from '~/@/l18n'
import { TopBar } from './top-bar'
import { Translator } from '~/@/l18n/generated'

export const Screen = (input: {
  id: string
  ctx: {
    t: Translator
  }
  topBar?: {
    title: TranslatedText
    subtitle?: TranslatedText | null
    onBack?: () => void
  }
  bottomButtons?: {
    buttons: BottomButtonInput[]
    onToggle: () => void
    open: boolean
  }
  children: VDomChildren
}) => {
  return (
    <div className='flex w-full flex-1 flex-col'>
      {input.topBar && <TopBar ctx={input.ctx} onBack={input.topBar.onBack} title={input.topBar.title} />}
      <div className='flex w-full flex-1 flex-col overflow-hidden'>{input.children}</div>
      {input.bottomButtons && (
        <BottomButtons.View
          id={`${input.id}-bottom-buttons`}
          ctx={input.ctx}
          buttons={input.bottomButtons.buttons}
          onToggle={input.bottomButtons.onToggle}
          open={input.bottomButtons.open}
        />
      )}
    </div>
  )
}
