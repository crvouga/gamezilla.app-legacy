import { p } from 'gamezilla-app/@/core/parser'

export const ALL_BOT_LEVELS = ['Easy', 'Medium', 'Hard'] as const

export const BotLevel = p.enumeration(ALL_BOT_LEVELS)

export type BotLevel = p.Infer<typeof BotLevel>

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard'
}
