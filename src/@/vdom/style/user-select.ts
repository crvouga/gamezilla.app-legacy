export type UserSelect = 'auto' | 'text' | 'none' | 'contain' | 'all'

const of = (userSelect: UserSelect) => {
  return {
    userSelect,
  }
}

export const UserSelect = {
  of,
}
