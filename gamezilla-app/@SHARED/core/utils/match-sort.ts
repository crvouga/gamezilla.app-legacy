import { editDistance } from "./edit-distance"
import { ascend } from "./sorting"

export const matchSort = <T>(
  items: T[],
  toValue: (item: T) => string,
  value: string,
): T[] => {
  return items
    .flatMap((item) => {
      const distance = editDistance(toValue(item), value)

      if (distance > 5) {
        return []
      }

      return [item]
    })
    .sort(
      ascend((item) => {
        return editDistance(toValue(item), value)
      }),
    )
}
