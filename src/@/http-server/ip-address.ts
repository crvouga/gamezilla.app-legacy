import os from 'os'

const FALLBACK_IP_ADDRESS = import.meta.env?.FALLBACK_IP_ADDRESS || '127.0.0.1'

export const getIpAddress = (): string => {
  const interfaces = os.networkInterfaces()

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }

  return FALLBACK_IP_ADDRESS
}
