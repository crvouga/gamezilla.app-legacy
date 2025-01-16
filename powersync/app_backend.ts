export const respond = async (input: { request: Request }): Promise<Response | null> => {
  const requestUrl = new URL(input.request.url)
  switch (requestUrl.pathname) {
    case '/powersync/update': {
      return new Response('update', { status: 200 })
    }
    case '/powersync/jwks': {
      return new Response(
        JSON.stringify({
          keys: [
            {
              kty: 'RSA',
              e: 'AQAB',
              use: 'sig',
              kid: 'test',
              alg: 'RS256',
              n: 'test',
            },
          ],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
    default: {
      return null
    }
  }
}

export const PowerSyncAppBackend = {
  respond,
}
