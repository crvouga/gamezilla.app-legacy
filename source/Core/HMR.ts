export const getData = <T>(key: string, getFallback: () => T): T => {
  if (import.meta.hot) {
    const value = import.meta.hot.data[key] ?? getFallback()

    import.meta.hot.data[key] = value

    return import.meta.hot.data[key]
  }

  return getFallback()
}

export const setData = <T>(key: string, value: T): void => {
  if (import.meta.hot) {
    import.meta.hot.data[key] = value
  }
}
