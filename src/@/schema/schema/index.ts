// Core types and utilities
export { isSchema, type Schema, type Infer } from './schema'
export { type ParseErrorEntry, ParseErrorEntry as ParseErrorEntryUtils } from './parse-error-entry'
export { toErrorMessage, safeJsonStringify, isIndexable } from './shared-utils'

// Schema variants
export * from './schema-noop'
export * from './schema-obj'
export * from './schema-partial-obj'
export * from './schema-str'
export * from './schema-num'
export * from './schema-literal'
export * from './schema-arr'
export * from './schema-maybe'
export * from './schema-dict'
export * from './schema-partial-dict'
export * from './schema-custom'
export * from './schema-unknown'
export * from './schema-any'
export * from './schema-enumeration'
export * from './schema-brand'
export * from './schema-regex'
export * from './schema-json'
export * from './schema-bool'
export * from './schema-partial'
export * from './schema-key-of'

// Additional schema utilities
export * from './schema-or'
export * from './schema-and'
export * from './schema-tuple'

// Main is function
import { type Schema } from './schema'

export const is =
  <T>(schema: Schema<T>) =>
  (input: unknown): input is T => {
    return schema.parse(input).t === 'ok'
  }
