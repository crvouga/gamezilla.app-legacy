declare global {
  interface Window {
    toggleDebugger: () => void
  }
}

const DEBUG_KEY = 'toggle-debugger/should-use-debugger'

window.toggleDebugger = () => {
  storageToggle(localStorage, DEBUG_KEY, 'true')
  window.location.reload()
}

const storageToggle = (storage: Storage, key: string, value: string) => {
  storage.getItem(key) === value ? storage.removeItem(key) : storage.setItem(key, value)
}

const isOn = (): boolean => {
  return localStorage.getItem(DEBUG_KEY) === 'true'
}

export const ToggleDebugger = {
  isOn,
}
