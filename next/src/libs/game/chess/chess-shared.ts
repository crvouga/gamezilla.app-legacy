type Mode = 'vs-bot' | 'vs-user' | 'puzzle' | 'none';

export type GameMsg = { t: 'mode-changed'; mode: Mode };
