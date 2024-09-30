import { twMerge } from 'tailwind-merge'

type ClassNameValue = ClassNameArray | string | null | undefined | 0 | 0n | false
type ClassNameArray = ClassNameValue[]

export const cn = (...classes: ClassNameValue[]): string => {
  return twMerge(...classes)
}
