type Mode = 'vs-bot' | 'vs-user' | 'puzzle' | 'none'

export type ChessMsgSpace = { t: 'mode-changed'; mode: Mode }
