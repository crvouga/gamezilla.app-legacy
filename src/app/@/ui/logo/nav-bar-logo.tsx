import { LOGO_TEXT } from './logo-text'

export const NavBarLogo = (input: { onClick: () => void }) => {
  return (
    <button className='flex h-full w-full items-center justify-center text-4xl' onClick={input.onClick}>
      {LOGO_TEXT}
    </button>
  )
}
