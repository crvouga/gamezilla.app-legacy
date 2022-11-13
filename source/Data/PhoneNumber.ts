import { phone } from "phone"
import { Result } from "../Core"
import * as ISO_3166 from "./ISO_3166"

export type PhoneNumber = {
  _opaque: "PhoneNumber"
  _validPhoneNumber: string
  _country: ISO_3166.Iso3166Alpha2Code
}

type Problem = "invalid_phone_number"

const decode = (
  country: ISO_3166.Iso3166Alpha2Code,
  phoneNumber: string,
): Result<Problem, PhoneNumber> => {
  const result = phone(phoneNumber, { country })

  if (result.isValid) {
    return Result.Ok({
      _opaque: "PhoneNumber",
      _validPhoneNumber: result.phoneNumber,
      _country: country,
    })
  }

  return Result.Err("invalid_phone_number")
}

const toString = (phoneNumber: PhoneNumber): string => {
  return phoneNumber._validPhoneNumber
}

const toCountry = (
  phoneNumber: PhoneNumber,
): ISO_3166.Iso3166Alpha2Code => {
  return phoneNumber._country
}

const eq = (a: PhoneNumber, b: PhoneNumber): boolean => {
  return a._validPhoneNumber === b._validPhoneNumber
}

export const PhoneNumber = {
  toString,
  eq,
  toCountry,
  decode
}