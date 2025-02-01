export const DialogHeader = (input: { title: string }) => {
  return (
    <h1 role='heading' aria-level={1} title={input.title} className='px-6 pb-2 pt-6 text-center text-2xl'>
      {input.title}
    </h1>
  )
}
