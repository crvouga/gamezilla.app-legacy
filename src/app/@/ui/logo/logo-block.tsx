import { LOGO_TEXT } from './logo-text'

export const SplashScreen = () => {
  return (
    <div className='fixed top-1/2 left-1/2 box-content flex h-[100dvh] w-[100dvw] -translate-x-1/2 -translate-y-1/2 items-center justify-center text-[68px]'>
      {LOGO_TEXT}
    </div>
  )
}
