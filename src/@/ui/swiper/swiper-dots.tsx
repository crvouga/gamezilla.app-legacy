export const SwiperDots = (input: { activeIndex: number; slideCount: number }) => {
  return (
    <div>
      {range(input.slideCount).map((index) => (
        <div
          key={index}
          className={`mx-1 h-2 w-2 rounded-full bg-neutral-300 ${input.activeIndex === index ? 'bg-neutral-500' : ''}`}
        />
      ))}
    </div>
  )
}

const range = (end: number) => {
  const arr = []
  for (let i = 0; i < end; i++) {
    arr.push(i)
  }
  return arr
}
