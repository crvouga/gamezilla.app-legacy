import { p } from '../core/parser'

export const HashingAlgo = p.or(
  p.obj({
    t: p.l('sha256')
  }),
  p.obj({
    t: p.l('bcrypt'),
    cost: p.num
  }),
  p.obj({
    t: p.l('argon2id'),
    memoryCost: p.num,
    timeCost: p.num
  }),
  p.obj({
    t: p.l('argon2i'),
    memoryCost: p.num,
    timeCost: p.num
  }),
  p.obj({
    t: p.l('argon2d'),
    memoryCost: p.num,
    timeCost: p.num
  })
)

export type HashingAlgo = p.Infer<typeof HashingAlgo>
