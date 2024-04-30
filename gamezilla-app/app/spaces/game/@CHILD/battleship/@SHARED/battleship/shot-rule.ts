import { Polymorphic } from "gamezilla-app/@SHARED/polymorphism/polymorphic-function"

export type ShotRule =
  | { t: "hitting-streak" }
  | { t: "chain-fire" }
  | { t: "count"; count: 1 | 2 | 3 | 4 | 5 | 6 }

export const toDescription_ = Polymorphic<(rule: ShotRule) => string>()

toDescription_.implementDefault((rule) => rule.t)

toDescription_.implement(
  (rule): rule is { t: "count"; count: 1 | 2 | 3 | 4 | 5 | 6 } =>
    rule.t === "count",
  (rule) => {
    const word = pluralize(rule.count, "time", "times")
    return `Shoot ${rule.count} ${word} per turn.`
  },
)

export const toDescription = (rule: ShotRule): string => {
  switch (rule.t) {
    case "count": {
      const word = pluralize(rule.count, "time", "times")
      return `Shoot ${rule.count} ${word} per turn.`
    }
    case "hitting-streak": {
      return "Continue shooting as long as you score hits."
    }
    case "chain-fire": {
      return "Shoot as often as you have ships left."
    }
  }
}

const pluralize = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural
}

export const toTitle = (rule: ShotRule): string => {
  switch (rule.t) {
    case "count": {
      return "Limited shots"
    }
    case "hitting-streak": {
      return "Hitting streak"
    }
    case "chain-fire": {
      return "Chain fire"
    }
  }
}

export const ShotRule = {
  toDescription,
  toTitle,
}
