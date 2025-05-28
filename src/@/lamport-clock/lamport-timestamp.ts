import { s } from '~/@/schema'

const parser = s.obj({
  _type: s.l('LamportTimestamp'),
  _value: s.num,
})

export type LamportTimestamp = s.Infer<typeof parser>

const fromNumber = (value: number): LamportTimestamp => {
  return {
    _type: 'LamportTimestamp',
    _value: Math.max(0, Math.floor(value)),
  }
}

const toNumber = (timestamp: LamportTimestamp): number => {
  return timestamp._value
}

const increment = (timestamp: LamportTimestamp): LamportTimestamp => {
  return fromNumber(timestamp._value + 1)
}

const max = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): LamportTimestamp => {
  return fromNumber(Math.max(timestampA._value, timestampB._value))
}

const lte = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA._value <= timestampB._value
}

const gte = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA._value >= timestampB._value
}

const eq = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA._value === timestampB._value
}

const lt = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA._value < timestampB._value
}

const gt = (timestampA: LamportTimestamp, timestampB: LamportTimestamp): boolean => {
  return timestampA._value > timestampB._value
}

export const LamportTimestamp = {
  ...parser,
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
