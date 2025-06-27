export type CssSelector = {
  class: (className: string) => CssSelector
  toString: () => string
}

export const CssSelector = (input?: { classes: string[] }): CssSelector => {
  const classes = input?.classes ?? []
  return {
    class: (className: string) => ({
      ...CssSelector({ classes: [...classes, className] }),
    }),
    toString: () => `.${classes.join('.')}`,
  }
}
