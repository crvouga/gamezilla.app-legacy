import { cn } from '~/@/ui/cn'
import { PAPER_CLASS_NAME } from './paper'
import { h } from '~/@/vdom/h'

export const ToggleButton = ({
  onToggle,
  checked,
  label,
}: {
  label: string
  id: string
  checked: boolean
  onToggle?: (e: Event) => void
}) => {
  const onChange = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
    if (onToggle) {
      onToggle(e)
    }
  }

  return h('label', { class: 'relative inline-flex cursor-pointer items-center' }, [
    h('input', {
      'aria-label': label,
      type: 'checkbox',
      value: '',
      class: 'peer sr-only',
      checked: checked,
      onChange: onChange,
    }),
    h('div', {
      class: cn(
        `peer h-6 w-11 rounded-full bg-neutral-200 peer-checked:bg-blue-500 peer-focus:ring-4 peer-focus:ring-blue-500 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full dark:peer-focus:ring-blue-500`,
        PAPER_CLASS_NAME,
      ),
    }),
  ])
}
