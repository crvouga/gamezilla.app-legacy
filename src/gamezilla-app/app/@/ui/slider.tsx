import { TranslatedText } from 'gamezilla-app/@/l18n'
import { Typography } from './typography'

export const Slider = ({
  label,
  max,
  min,
  step,
  value,
  onInput
}: {
  value: number
  label: TranslatedText
  min: number
  max: number
  step: number
  onInput?: (newValue: number) => void
}) => {
  return (
    <div>
      <Typography variant='label' text={label} />
      <input
        type='range'
        min={min}
        max={max}
        value={value}
        step={step}
        onInput={(msgEvt) => {
          if (!msgEvt.target) {
            return
          }
          const val = 'value' in msgEvt.target ? msgEvt.target.value : ''
          const parsed = typeof val === 'string' ? Number.parseFloat(val) : Number.NaN
          if (Number.isNaN(parsed)) {
            return
          }
          onInput?.(parsed)
        }}
        className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-500'
      />
    </div>
  )
}
