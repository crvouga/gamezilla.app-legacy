export const parseCookies = (request: Request): Record<string, string> => {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) {
    return {}
  }

  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map((part) => part.trim())
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
    return cookies
  }, {} as Record<string, string>)
}
