export const extToContentType = (ext: string) => {
  switch (normalizeExt(ext)) {
    case 'html':
      return 'text/html'
    case 'css':
      return 'text/css'
    case 'js':
      return 'application/javascript'
    case 'json':
      return 'application/json'
    case 'svg':
      return 'image/svg+xml'
    case 'png':
      return 'image/png'
    case 'jpg':
      return 'image/jpeg'
    case 'ico':
      return 'image/x-icon'
    case 'txt':
      return 'text/plain'
    case 'woff':
      return 'font/woff'
    case 'woff2':
      return 'font/woff2'
    case 'ttf':
      return 'font/ttf'
    case 'eot':
      return 'font/eot'
    case 'otf':
      return 'font/otf'
    case 'wasm':
      return 'application/wasm'
    case 'webp':
      return 'image/webp'
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'ogg':
      return 'video/ogg'
    case 'mp3':
      return 'audio/mpeg'
    case 'wav':
      return 'audio/wav'
    case 'aac':
      return 'audio/aac'
    case 'flac':
      return 'audio/flac'
    case 'map':
      return 'application/json'
    default:
      return 'application/octet-stream'
  }
}
const normalizeExt = (ext: string) => {
  const cleaned = ext.trim().toLowerCase()
  return cleaned.startsWith('.') ? cleaned.slice(1) : cleaned
}
