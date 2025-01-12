export const fileExtensionToContentType = (ext: string) => {
  switch (ext) {
    case '.html':
      return 'text/html'
    case '.css':
      return 'text/css'
    case '.js':
      return 'application/javascript'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.ico':
      return 'image/x-icon'
    case '.json':
      return 'application/json'
    case '.txt':
      return 'text/plain'
    // case '.wav':
    //   return 'audio/wav'
    // case '.mp3':
    //   return 'audio/mpeg'
    // case '.mp4':
    //   return 'video/mp4'
    // case '.webm':
    //   return 'video/webm'
    default:
      return 'application/octet-stream'
  }
}
