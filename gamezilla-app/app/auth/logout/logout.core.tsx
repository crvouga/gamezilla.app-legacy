export type ModelClient = {}

export type MsgClient =
  | { t: 'logout-drawer.closed' }
  | { t: 'logout-drawer.clicked-cancel' }
  | { t: 'logout-drawer.clicked-confirm' }

export type MsgServer = { t: 'noop' }

export type MsgToServer = { t: 'logout' }

export type MsgToClient = { t: 'noop' }
