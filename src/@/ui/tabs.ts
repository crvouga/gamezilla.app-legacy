import { TranslatedText } from '~/@/l18n'
import { ClickableTransparent } from './clickable'
import { cn } from './cn'
import { h } from '~/@/vdom/h'

export const Tabs = <TTab extends string>({
  tabs,
  selected,
  onSelect,
  labels,
}: {
  tabs: TTab[]
  selected: TTab
  labels: { [tab in TTab]: TranslatedText }
  onSelect: (tab: TTab) => void
}) => {
  return h('div', {
    className: 'flex w-full items-center',
    children: tabs.map((tab, index) => {
      return h('div', {
        key: tab,
        className: 'flex-1 shrink-0',
        children: h(ClickableTransparent, {
          key: tab,
          onClick: () => onSelect(tab),
          className: cn(
            'flex h-full w-full items-center justify-center py-3 text-xl font-bold',
            index !== tabs.length - 1 && 'border-r-2',
            selected === tab ? 'border-b-blue-500 text-blue-500' : 'text-neutral-300',
          ),
          children: labels[tab],
        }),
      })
    }),
  })
}
