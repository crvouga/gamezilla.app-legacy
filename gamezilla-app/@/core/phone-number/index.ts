import { Iso3166Alpha2Code } from '../Iso-3166-alpha-2-code'
import { p } from '../parser'
import { Result } from '../result'
import { phone } from './phone'

const parser = p.obj({
  _country: Iso3166Alpha2Code,
  _validPhoneNumber: p.str,
  _opaque: p.l('PhoneNumber')
})

export type PhoneNumber = p.Infer<typeof parser>

type Problem = 'invalid_phone_number'

const fromStringDeriveCountry = (phoneNumber: string): Result<Problem, PhoneNumber> => {
  let countryCode: Iso3166Alpha2Code | undefined

  for (const countryCodeCandiate of Iso3166Alpha2Code.all) {
    const result = phone(phoneNumber, {
      country: countryCodeCandiate
    })

    if (!result.isValid) {
      continue
    }
    countryCode = countryCodeCandiate
  }

  const result = phone(phoneNumber, {
    country: countryCode
  })

  if (!result.isValid) {
    return Result.Err('invalid_phone_number')
  }

  const country = Iso3166Alpha2Code.is(result.countryCode)
    ? result.countryCode
    : Iso3166Alpha2Code.is(result.countryIso2)
    ? result.countryIso2
    : Iso3166Alpha2Code.is(result.countryIso3)
    ? result.countryIso3
    : null

  if (!country) {
    return Result.Err('invalid_phone_number')
  }

  return Result.Ok({
    _opaque: 'PhoneNumber',
    _validPhoneNumber: result.phoneNumber,
    _country: country
  })
}

const fromString = (phoneNumber: unknown, maybeCountryCode?: Iso3166Alpha2Code): Result<Problem, PhoneNumber> => {
  if (typeof phoneNumber !== 'string') {
    return Result.Err('invalid_phone_number')
  }

  if (maybeCountryCode) {
    const result = phone(phoneNumber, {
      country: maybeCountryCode
    })

    if (!result.isValid) {
      return Result.Err('invalid_phone_number')
    }

    return Result.Ok({
      _opaque: 'PhoneNumber',
      _validPhoneNumber: result.phoneNumber,
      _country: maybeCountryCode
    })
  }

  if (!phoneNumber.startsWith('+')) {
    return fromStringDeriveCountry(phoneNumber)
  }

  const result = phone(phoneNumber)

  if (!result.isValid) {
    return Result.Err('invalid_phone_number')
  }

  const country = Iso3166Alpha2Code.is(result.countryCode)
    ? result.countryCode
    : Iso3166Alpha2Code.is(result.countryIso2)
    ? result.countryIso2
    : Iso3166Alpha2Code.is(result.countryIso3)
    ? result.countryIso3
    : null

  if (!country) {
    return Result.Err('invalid_phone_number')
  }

  return Result.Ok({
    _opaque: 'PhoneNumber',
    _validPhoneNumber: result.phoneNumber,
    _country: country
  })
}

const unsafeParse = (phoneNumber: string): PhoneNumber => {
  const result = fromString(phoneNumber)
  if (result.t === 'err') {
    throw new Error('Invalid phone number')
  }
  return result.value
}

const toString = (phoneNumber: PhoneNumber): string => {
  return phoneNumber._validPhoneNumber
}

const toCountry = (phoneNumber: PhoneNumber): Iso3166Alpha2Code => {
  return phoneNumber._country
}

const eq = (a: PhoneNumber, b: PhoneNumber): boolean => {
  return a._validPhoneNumber === b._validPhoneNumber
}

const format = (phoneNumber: PhoneNumber): string => {
  const { _validPhoneNumber: rawPhoneNumber } = phoneNumber

  const numericPhoneNumber = rawPhoneNumber.replace(/\D/g, '')

  if (numericPhoneNumber.length !== 11) {
    return rawPhoneNumber
  }

  const countryCode = numericPhoneNumber.slice(0, 1)
  const areaCode = numericPhoneNumber.slice(1, 4)
  const localNumber = numericPhoneNumber.slice(4)

  return `+${countryCode} (${areaCode}) ${localNumber.slice(0, 3)}-${localNumber.slice(3)}`
}

const is = (phoneNumber: unknown): phoneNumber is PhoneNumber => {
  return fromString(phoneNumber).t === 'ok'
}

const countries = [
  { code: 'US', format: '10000000000' },
  { code: 'GB', format: '20000000000' },
  { code: 'DE', format: '30000000000' },
  { code: 'IN', format: '40000000000' }
] as const

const random = (): PhoneNumber => {
  const countryIndex = Math.floor(Math.random() * countries.length)
  const country = countries[countryIndex]

  if (!country) {
    throw new Error('Invalid country')
  }

  const phoneNumber = country.format.replace(/[0-9]/g, () => Math.floor(Math.random() * 10).toString())

  const phoneNumberResult = fromString(phoneNumber)

  if (phoneNumberResult.t === 'ok') {
    return phoneNumberResult.value
  }
  return random()
}

export const PhoneNumber = {
  ...parser,
  random,
  is,
  toString,
  eq,
  toCountry,
  fromString,
  unsafeParse,
  format
}
