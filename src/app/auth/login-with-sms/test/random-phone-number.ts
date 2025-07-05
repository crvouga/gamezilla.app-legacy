import { PhoneNumber } from '~/@/phone-number'

export const randomPhoneNumber = (): number => {
  const basePhoneNumber = 480_209_0000
  const random4Digits = Math.floor(Math.random() * 10000)
  const phoneNumber = basePhoneNumber + random4Digits
  PhoneNumber.unsafeParse(phoneNumber.toString())
  return phoneNumber
}
