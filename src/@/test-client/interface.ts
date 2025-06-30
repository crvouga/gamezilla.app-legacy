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
}

export type TestClientQueryConfig = {
  poll?: TimeSpan
  maxWait?: TimeSpan
  onPoll?: () => void
  onDone?: () => void
}

export type ITestClient = {
  query: (selector: string, config?: TestClientQueryConfig) => Promise<ITestNode[]>
  audio: () => Promise<PlayedAudioRecord[]>
}
