import { p } from '~/@/schema'
import { Translator } from '~/@/l18n/generated'
import { IconXMark } from '~/@/ui/icon/icon-x-mark'
import { Slider } from '~/@/ui/slider'

export const Model = p.obj({
  t: p.l('flow-grid'),
  width: p.num,
  height: p.num,
})

export type Model = p.Infer<typeof Model>

export const init = (model: { width: number; height: number }): Model => {
  return {
    t: 'flow-grid',
    width: model.width,
    height: model.height,
  }
}

export const ViewForm = (input: {
  form: Model
  onInput: (dimensions: Model) => void
  ctx: {
    t: Translator
  }
}) => {
  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-center gap-1 text-center text-4xl font-bold'>
        <p>{`${input.form.width}w`}</p>

        <IconXMark className='size-6' />

        <p>{`${input.form.height}h`}</p>
      </div>

      <div className='flex flex-col gap-3'>
        <Slider
          onInput={(width) => input.onInput({ ...input.form, width })}
          value={input.form.width}
          label={input.ctx.t('app.width')}
          min={3}
          max={15}
          step={1}
        />
        <Slider
          onInput={(height) => input.onInput({ ...input.form, height })}
          value={input.form.height}
          label={input.ctx.t('app.height')}
          min={3}
          max={15}
          step={1}
        />
      </div>
    </div>
  )
}
