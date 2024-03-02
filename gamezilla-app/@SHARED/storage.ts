/**
 * Use this to persist state across page refreshes.
 * It retains type safety by using deployment IDs.
 */
export const Storage = <TModel>(codebaseVersionId: string) => {
  const CODEBASE_VERSION_ID_KEY = "gamezilla-app/codebase-version-id"
  const MODEL_KEY = "gamezilla-app/model"

  return {
    get() {
      const storedId = sessionStorage.getItem(CODEBASE_VERSION_ID_KEY)

      if (storedId !== codebaseVersionId) {
        return null
      }

      const got = sessionStorage.getItem(MODEL_KEY)

      const maybeModel = got ? (JSON.parse(got) as TModel) : null

      return maybeModel
    },

    set(model: TModel) {
      sessionStorage.setItem(CODEBASE_VERSION_ID_KEY, codebaseVersionId)
      sessionStorage.setItem(MODEL_KEY, JSON.stringify(model))
    },
  }
}
