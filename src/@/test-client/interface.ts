import { PlayedAudioRecord } from '../audio-player'
import { TimeSpan } from '../time/time-span'

export type TestAction =
  | { t: 'keydown'; key: string }
  | { t: 'click' }
  | { t: 'input'; value: string }
  | { t: 'change'; value: string }
  | { t: 'submit' }

export type ITestNode = {
  text: () => Promise<string | null>
  attr: (name: string) => Promise<string | null>
  do: (action: TestAction) => Promise<void>
  find: (selector: string, config?: TestClientQueryConfig) => Promise<ITestNode[]>
}

export type TestClientQueryConfig = {
  poll?: TimeSpan
  maxWait?: TimeSpan
  onPoll?: () => void
  onDone?: () => void
}

export type ITestClientBase = {
  find: (selector: string, config?: TestClientQueryConfig) => Promise<ITestNode[]>
  audio: () => Promise<PlayedAudioRecord[]>
}

export type ITestClient = ITestClientBase & {
  findByTestId: (testId: string) => Promise<ITestNode | null>
}

export const fromBase = (base: ITestClientBase): ITestClient => {
  return {
    ...base,
    findByTestId: async (testId) => {
      const [node] = await base.find(`[data-testid="${testId}"]`)
      return node ?? null
    },
  }
}
