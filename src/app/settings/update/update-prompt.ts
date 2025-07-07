import { ILogger } from '~/@/logger'

export const registerServiceWorker = async (_config: { logger: ILogger }) => {
  if (typeof window === 'undefined') return
  // const { registerSW } = await import('virtual:pwa-register')
  // const logger = config.logger.child(['frontend', 'update-prompt'])
  // logger.info('registerSW')
  // const updateSW = registerSW({
  //   onNeedRefresh() {
  //     logger.info('onNeedRefresh')
  //     if (confirm('New content available. Reload to update?')) {
  //       updateSW(true)
  //     }
  //   },
  //   onOfflineReady() {
  //     logger.info('onOfflineReady')
  //     if (confirm('App ready to work offline')) {
  //       updateSW(true)
  //     }
  //   },
  //   onRegisteredSW(swUrl, r) {
  //     logger.info('onRegisteredSW', swUrl, r)
  //   },
  //   onRegisterError(error) {
  //     logger.error('onRegisterError', error)
  //   },
  //   immediate: true,
  // })
}
