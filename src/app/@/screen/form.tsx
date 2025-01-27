import { TranslatedText } from '~/@/l18n'
import { VDomChildren } from '~/@/vdom/vdom'

export const ViewForm = (input: {
  children: VDomChildren
  onSubmit: () => void
  className?: string
  noValidate?: boolean
  name: TranslatedText
}) => {
  return (
    <form
      className={input.className}
      onSubmit={(e) => {
        e.preventDefault()
        input.onSubmit()
      }}
      noValidate={input.noValidate}
      name={input.name}
      aria-label={input.name}
    >
      {input.children}
    </form>
  )
}
