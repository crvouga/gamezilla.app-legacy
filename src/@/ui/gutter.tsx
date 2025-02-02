export const Gutter = (input: { variant: 'drawer' | 'screen' }) => {
  switch (input.variant) {
    case 'screen': {
      return <div className='w-full pt-12'></div>
    }
    case 'drawer': {
      return <div className='w-full pt-3'></div>
    }
  }
}
