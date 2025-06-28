import { TimeSpan } from '../time/time-span'
import { UnixMs } from '../time/unix-ms'

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

export type PlayedAudioRecord = {
  startedAt: UnixMs
  endedAt: UnixMs | null
  duration: TimeSpan
  url: string
}

export type ITestClient = {
  query: (
    selector: string,
    config?: {
      poll?: TimeSpan
      maxWait?: TimeSpan
      onPoll?: () => void
      onDone?: () => void
    },
  ) => Promise<ITestNode[]>
  audio: () => PlayedAudioRecord[]
}
