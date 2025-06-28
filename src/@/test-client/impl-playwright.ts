import type { ITestClient } from './interface'

export type Config = {
  t: 'playwright'
}

export const TestClient = (_config: Config): ITestClient => {
  return {
    audio() {
      return []
    },
    async query(_selector: string) {
      throw new Error('Not implemented')
    },
  }
}
