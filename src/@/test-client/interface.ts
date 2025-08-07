import { PlayedAudioRecord } from '../audio-player'
import { AriaRole } from '../html/aria-role'
import { TimeSpan } from '../time/time-span'

export type TestAction =
  | { t: 'keydown'; key: string }
  | { t: 'click' }
  | { t: 'input'; value: string }
  | { t: 'change'; value: string }
  | { t: 'submit' }

export type ITestNode = {
  find: (selector: string, config?: FindConfig) => Promise<ITestNode[]>
  findByTestId: (testId: string) => Promise<ITestNode | null>
  findByRole: (role: AriaRole, label?: string, config?: FindConfig) => Promise<ITestNode | null>
  text: () => Promise<string | null>
  inputValue: () => Promise<string | null>
  attr: (name: string) => Promise<string | null>
  do: (action: TestAction) => Promise<void>
  isVisible: () => Promise<boolean>
  audio: () => Promise<PlayedAudioRecord[]>
}

export type FindConfig = {
  poll?: TimeSpan
  maxWait?: TimeSpan
  onPoll?: () => void
  onDone?: () => void
}

export const findByTestId = async (node: ITestNode, testId: string): Promise<ITestNode | null> => {
  const [found] = await node.find(`[data-testid="${testId}"]`)
  return found ?? null
}

export const findByRole = async (
  node: ITestNode,
  role: AriaRole,
  label?: string,
  config?: FindConfig,
): Promise<ITestNode | null> => {
  const css = `[role="${role}" i]${label ? `[aria-label*="${label}" i]` : ''}`
  const [found] = await node.find(css, config)
  return found ?? null
}
