import { TranslatedText } from '~/@/l18n'
import { Translator } from '~/@/l18n/generated'
import type { VDom } from '~/@/vdom/vdom'
import { cn } from '~/@/ui'
import { ScreenLayout } from '~/app/@/ui/screen-layout'

export const LayoutGameCoverArtHeader = (input: {
  topBar?: {
    title: TranslatedText
    subtitle?: TranslatedText | null
    onBack?: () => void
  }
  renderCoverArt?: (input: { className: string }) => VDom
  ctx: {
    t: Translator
  }

  renderContent: () => VDom
}) => {
  const renderCoverArt_ = input.renderCoverArt || renderDefaultCoverArt
  return (
    <ScreenLayout
      id='game-cover-art-header'
      ctx={input.ctx}
      topBar={input.topBar}
      main={
        <div className='flex w-full flex-1 flex-col items-center overflow-y-auto'>
          {renderCoverArt_({ className: 'size-28 overflow-hidden rounded-lg' })}
          {input.renderContent()}
        </div>
      }
    />
  )
}

const renderDefaultCoverArt = (input: { className: string }) => {
  return (
    <div
      className={cn(
        'text-secondary bg-paper flex items-center justify-center overflow-hidden rounded-lg p-4',
        input.className,
      )}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 640 512'
        className='h-16 w-16'
        fill='currentColor'
        stroke='currentColor'
      >
        <path d='M192 64C86 64 0 150 0 256S86 448 192 448H448c106 0 192-86 192-192s-86-192-192-192H192zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24v32h32c13.3 0 24 10.7 24 24s-10.7 24-24 24H216v32c0 13.3-10.7 24-24 24s-24-10.7-24-24V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h32V200z' />
      </svg>
    </div>
  )
}
