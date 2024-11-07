import { TranslatedText } from '@/l18n'
import { Translator } from '@/l18n/generated'
import type { VDom } from '@/vdom'
import { cn, TopBar } from 'gamezilla-app/app/@/ui'

export const LayoutGameCoverArtHeader = (input: {
  title: TranslatedText
  renderCoverArt?: (input: { key: string; className: string }) => VDom
  onBack: (() => void) | false
  ctx: {
    t: Translator
  }
  renderContent: VDom
}) => {
  const renderCoverArt_ = input.renderCoverArt || renderDefaultCoverArt
  return (
    <div className='flex h-full w-full flex-1 flex-col items-center gap-4 pb-4'>
      <TopBar ctx={input.ctx} onBack={input.onBack} title={input.title} center />
      <div className='flex w-full flex-1 flex-col items-center overflow-y-auto'>
        {renderCoverArt_({
          key: input.title,
          className: 'w-28 h-28 overflow-hidden rounded-lg'
        })}
        {input.renderContent()}
      </div>
    </div>
  )
}

const renderDefaultCoverArt = (input: { key: string; className: string }) => {
  return (
    <div
      key={input.key}
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-lg  bg-neutral-800 p-4 text-secondary',
        input.className
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
