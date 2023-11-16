import { Result } from "../../result";
import { Iso3166Alpha2Code } from "../Iso-3166-alpha-2-code";
import { phone } from "./phone";

export type PhoneNumber = {
  _opaque: "PhoneNumber";
  _validPhoneNumber: string;
  _country: Iso3166Alpha2Code;
};

type Problem = "invalid_phone_number";

const parse = (
  country: Iso3166Alpha2Code,
  phoneNumber: string
): Result<{ code: Problem; userMessage: string }, PhoneNumber> => {
  const result = phone(phoneNumber, { country });

  if (result.isValid) {
    return Result.ok({
      _opaque: "PhoneNumber",
      _validPhoneNumber: result.phoneNumber,
      _country: country,
    });
  }

  return Result.err({
    code: "invalid_phone_number",
    userMessage: `Invalid phone number`,
  });
};

const toString = (phoneNumber: PhoneNumber): string => {
  return phoneNumber._validPhoneNumber;
};

const toCountry = (phoneNumber: PhoneNumber): Iso3166Alpha2Code => {
  return phoneNumber._country;
};

const eq = (a: PhoneNumber, b: PhoneNumber): boolean => {
  return a._validPhoneNumber === b._validPhoneNumber;
};

const format = (phoneNumber: PhoneNumber): string => {
  const { _validPhoneNumber: rawPhoneNumber } = phoneNumber;
  // Remove all non-numeric characters from the phone number
  const numericPhoneNumber = rawPhoneNumber.replace(/\D/g, "");

  // If the numeric phone number is not 11 digits (including country code), return it as-is
  if (numericPhoneNumber.length !== 11) {
    return rawPhoneNumber;
  }

  // Extract the country code, area code, and local number from the numeric phone number
  const countryCode = numericPhoneNumber.slice(0, 1);
  const areaCode = numericPhoneNumber.slice(1, 4);
  const localNumber = numericPhoneNumber.slice(4);

  // Return the formatted phone number
  return `+${countryCode} (${areaCode}) ${localNumber.slice(
    0,
    3
  )}-${localNumber.slice(3)}`;
};

export const PhoneNumber = {
  toString,
  eq,
  toCountry,
  parse,
  format,
};
