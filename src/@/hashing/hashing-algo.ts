import { s } from '~/@/schema'

export const Sha256Algo = s.obj({
  t: s.l('sha256'),
})
export type Sha256Algo = s.Infer<typeof Sha256Algo>

// export const BcryptAlgo = s.obj({
//   t: s.l('bcrypt'),
//   cost: s.num(),
// })
// export type BcryptAlgo = s.Infer<typeof BcryptAlgo>

// export const Argon2idAlgo = s.obj({
//   t: s.l('argon2id'),
//   memoryCost: s.num(),
//   timeCost: s.num(),
// })
// export type Argon2idAlgo = s.Infer<typeof Argon2idAlgo>

// export const Argon2iAlgo = s.obj({
//   t: s.l('argon2i'),
//   memoryCost: s.num(),
//   timeCost: s.num(),
// })
// export type Argon2iAlgo = s.Infer<typeof Argon2iAlgo>

// export const Argon2dAlgo = s.obj({
//   t: s.l('argon2d'),
//   memoryCost: s.num(),
//   timeCost: s.num(),
// })
// export type Argon2dAlgo = s.Infer<typeof Argon2dAlgo>

export const HashingAlgo = s.or(
  Sha256Algo,
  // BcryptAlgo,
  // Argon2idAlgo, Argon2iAlgo, Argon2dAlgo
)
export type HashingAlgo = s.Infer<typeof HashingAlgo>
