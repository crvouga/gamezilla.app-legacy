const serverError = (error: string): Response => {
  return new Response(error, {
    status: 500,
  })
}

const json = <T>(input: T): Response => {
  const json = JSON.stringify(input)
  return new Response(json, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const HttpResponse = {
  serverError,
  json,
}
