import { s } from '~/@/schema'

export const ALL_BOT_LEVELS = ['Easy', 'Medium', 'Hard'] as const

export const BotLevel = s.enumeration(ALL_BOT_LEVELS)

export type BotLevel = s.Infer<typeof BotLevel>

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
}
