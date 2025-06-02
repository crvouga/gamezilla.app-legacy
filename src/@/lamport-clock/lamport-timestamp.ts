import { s } from '~/@/schema'

const schema = s.brand(s.num(), 'LamportTimestamp')

export type LamportTimestamp = s.Infer<typeof schema>

const fromNumber = (value: number): LamportTimestamp => {
  return Math.max(0, Math.floor(value)) as LamportTimestamp
}

const toNumber = (timestamp: LamportTimestamp): number => {
  return timestamp
}

const increment = (timestamp: LamportTimestamp): LamportTimestamp => {
  return fromNumber(timestamp + 1)
}

const max = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): LamportTimestamp => {
  return fromNumber(Math.max(timestampA, timestampB))
}

const lte = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA <= timestampB
}

const gte = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA >= timestampB
}

const eq = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA === timestampB
}

const lt = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA < timestampB
}

const gt = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA > timestampB
}

export const LamportTimestamp = {
  ...schema,
  fromNumber,
  toNumber,
  max,
  increment,
  lte,
  lt,
  eq,
  gte,
  gt,
}
