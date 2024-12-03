import { describe, expect, test } from 'bun:test'
import { cn } from './cn'

describe(import.meta.url, () => {
  test('override height classes', () => {
    const initialClass = 'h-10'
    const overrideClass = 'h-20'
    const result = cn(initialClass, overrideClass)
    expect(result).toBe(overrideClass)
  })

  test('override width classes', () => {
    const initialClass = 'w-10'
    const overrideClass = 'w-20'
    const result = cn(initialClass, overrideClass)
    expect(result).toBe(overrideClass)
  })

  test('override text-color', () => {
    const initialClass = 'text-blue-500 text-xs'
    const overrideClass = 'text-red-500'
    const expected = 'text-xs text-red-500'
    const actual = cn(initialClass, overrideClass)
    expect(actual).toBe(expected)
  })

  test('override text-color and text-size', () => {
    const initialClass = 'text-blue-500 text-xs'
    const overrideClass = 'text-lg text-red-500'
    const expected = 'text-lg text-red-500'
    const actual = cn(initialClass, overrideClass)
    expect(actual).toBe(expected)
  })

  test('override text-color and text-size and text-weight', () => {
    const initialClass = 'text-blue-500 text-xs font-bold'
    const overrideClass = 'text-lg text-red-500'
    const expected = 'font-bold text-lg text-red-500'
    const actual = cn(initialClass, overrideClass)
    expect(actual).toBe(expected)
  })

  test('override font-weight', () => {
    const initialClass = 'font-bold'
    const overrideClass = 'font-normal'
    const result = cn(initialClass, overrideClass)
    expect(result).toBe(overrideClass)
  })

  test('text alignment and text size are independent of each other', () => {
    const className = 'text-left text-lg'
    const actual = cn(className)
    expect(actual).toBe(className)
  })

  test('text alignment and text color are independent of each other', () => {
    const className = 'text-white text-center'
    const actual = cn(className)
    expect(actual).toBe(className)
  })

  test('border and border-color are independent of each other', () => {
    const className = 'border-2 border-blue-500/40'
    const actual = cn(className)
    expect(actual).toBe(className)
  })

  test('bg-gradient and bg-clip are independent of each other', () => {
    const className = 'bg-gradient-to-b bg-clip-text'
    const actual = cn(className)
    expect(actual).toBe(className)
  })

  test('text alignment and text color are independent of each other reversed', () => {
    const className = 'text-center text-white'
    const actual = cn(className)
    expect(actual).toBe(className)
  })

  test('ignore empty string', () => {
    const initialClass = 'h-10'
    const overrideClass = ''
    const result = cn(initialClass, overrideClass)
    expect(result).toBe(initialClass)
  })
})
