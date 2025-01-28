import { p } from '~/@/parser'
import { Translator } from '~/@/l18n/generated'
import { IconXMark, Slider } from '~/@/ui'

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

export const ViewForm = ({
  form,
  onInput,
  ctx,
}: {
  form: Model
  onInput: (dimensions: Model) => void
  ctx: {
    t: Translator
  }
}) => {
  return (
    <>
      <div className='flex items-center justify-center gap-1 text-center text-4xl font-bold'>
        <p>{`${form.width}w`}</p>

        <IconXMark className='size-6' />

        <p>{`${form.height}h`}</p>
      </div>

      <div className='flex flex-col gap-3 p-4 pb-8'>
        <Slider
          onInput={(width) => onInput({ ...form, width })}
          value={form.width}
          label={ctx.t('app.width')}
          min={3}
          max={15}
          step={1}
        />
        <Slider
          onInput={(height) => onInput({ ...form, height })}
          value={form.height}
          label={ctx.t('app.height')}
          min={3}
          max={15}
          step={1}
        />
      </div>
    </>
  )
}
