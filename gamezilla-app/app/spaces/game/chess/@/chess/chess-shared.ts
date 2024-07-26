type Mode = 'vs-bot' | 'vs-user' | 'puzzle' | 'none';

export type ChessMsgCore = {t: 'mode-changed'; mode: Mode};
