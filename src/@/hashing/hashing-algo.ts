import { s } from '~/@/schema'

export const HashingAlgo = s.or(
  s.obj({
    t: s.l('sha256'),
  }),
  s.obj({
    t: s.l('bcrypt'),
    cost: s.num,
  }),
  s.obj({
    t: s.l('argon2id'),
    memoryCost: s.num,
    timeCost: s.num,
  }),
  s.obj({
    t: s.l('argon2i'),
    memoryCost: s.num,
    timeCost: s.num,
  }),
  s.obj({
    t: s.l('argon2d'),
    memoryCost: s.num,
    timeCost: s.num,
  }),
)

export type HashingAlgo = s.Infer<typeof HashingAlgo>
