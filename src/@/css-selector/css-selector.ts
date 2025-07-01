export type CssSelector = {
  class: (class_: string) => CssSelector
  toString: () => string
}

export const CssSelector = (input?: { classes: string[] }): CssSelector => {
  const classes = input?.classes ?? []
  return {
    class: (class_: string) => ({
      ...CssSelector({ classes: [...classes, class_] }),
    }),
    toString: () => `.${classes.join('.')}`,
  }
}
