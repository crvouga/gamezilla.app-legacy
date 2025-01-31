import type { VDom } from '~/@/vdom/vdom'

export const ButtonVertical = ({
  children,
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
  children?: VDom
}) => {
  return (
    <button
      className={['flex h-14 w-14 flex-col items-center justify-center', className ? className : ''].join(' ')}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
