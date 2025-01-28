export const LOGO_TEXT = '🦕'
export const NavBarLogo = (input: { onClick: () => void }) => {
  return (
    <button className='flex h-full w-full items-center justify-center text-5xl' onClick={input.onClick}>
      {LOGO_TEXT}
    </button>
  )
}

export const LoadingStateLogo = () => {
  return (
    <div className='fixed left-1/2 top-1/2 box-border -translate-x-1/2 -translate-y-1/2 text-[68px]'>{LOGO_TEXT}</div>
  )
}
