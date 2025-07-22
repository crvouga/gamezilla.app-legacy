import { TranslatedText } from '~/@/l18n'
import { Box } from '~/@/vdom/box'
import { h } from '~/@/vdom/h'
import { ClickableTransparent } from './clickable'
import { cn } from './cn'

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
  return h(Box, {
    class: 'flex w-full items-center',
    children: tabs.map((tab, index) =>
      h(
        Box,
        {
          key: tab,
          class: 'flex-1 shrink-0',
        },
        [
          h(
            ClickableTransparent,
            {
              onClick: () => onSelect(tab),
              class: cn(
                'flex h-full w-full items-center justify-center py-3 text-xl font-bold',
                index !== tabs.length - 1 && 'border-r-2',
                selected === tab ? 'border-b-blue-500 text-blue-500' : 'text-neutral-300',
              ),
            },
            [labels[tab]],
          ),
        ],
      ),
    ),
  })
}
