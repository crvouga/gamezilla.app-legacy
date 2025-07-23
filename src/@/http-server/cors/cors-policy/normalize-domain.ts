export const normalizeDomain = (domain: string | undefined | null) => {
  return domain
    ?.replace(/^https?:\/\//, '') // Remove protocol
    ?.split(':')[0] // Remove port
    ?.toLowerCase() // Normalize case
    ?.trim() // Remove whitespace
    ?.replace(/\/$/, '') // Remove trailing slash
    ?.replace(/^www\./i, '') // Remove www prefix
    ?.replace(/\s+/g, '') // Remove all whitespace
    ?.replace(/[^\w.-]/g, '') // Only allow alphanumeric, dots and hyphens
    ?.replace(/\.+/g, '.') // Replace multiple dots with single dot
    ?.replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    ?.split('.')
    ?.slice(-2) // Keep only domain and TLD
    ?.join('.')
}
