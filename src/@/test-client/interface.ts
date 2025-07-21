import { PlayedAudioRecord } from '../audio-player'
import { TimeSpan } from '../time/time-span'
import { AriaRole } from '../html/aria-role'

export type TestAction =
  | { t: 'keydown'; key: string }
  | { t: 'click' }
  | { t: 'input'; value: string }
  | { t: 'change'; value: string }
  | { t: 'submit' }

export type IFindable = {
  find: (selector: string, config?: FindConfig) => Promise<ITestNode[]>
}

export type ITestNode = IFindable & {
  text: () => Promise<string | null>
  attr: (name: string) => Promise<string | null>
  do: (action: TestAction) => Promise<void>
  isVisible: () => Promise<boolean>
}

export type FindConfig = {
  poll?: TimeSpan
  maxWait?: TimeSpan
  onPoll?: () => void
  onDone?: () => void
}

export type ITestClientBase = IFindable & {
  audio: () => Promise<PlayedAudioRecord[]>
}

export type ITestClient = ITestClientBase & {
  findByTestId: (testId: string) => Promise<ITestNode | null>
  findByRole: (role: AriaRole, label?: string, config?: FindConfig) => Promise<ITestNode | null>
}

export const fromBase = (base: ITestClientBase): ITestClient => {
  return {
    ...base,
    findByTestId: async (testId) => {
      const [node] = await base.find(`[data-testid="${testId}"]`)
      return node ?? null
    },
    findByRole: async (role, label, config) => {
      const css = `[role="${role}"]${label ? `[aria-label="${label}" i]` : ''}`
      const [node] = await base.find(css, config)
      return node ?? null
    },
  }
}
