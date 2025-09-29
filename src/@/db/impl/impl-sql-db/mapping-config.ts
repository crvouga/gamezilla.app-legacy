export type MappingConfig<TEntity extends Record<string, unknown>, TRow extends Record<string, unknown>> = {
  mapValueEntityToSql: {
    [K in keyof TEntity]: (value: TEntity[K]) => string | number | symbol | null | undefined | boolean
  }
  mapValueSqlToEntity: {
    [K in keyof TRow]: (value: TRow[K]) => TEntity[keyof TEntity] | null | undefined | boolean
  }
  mapKeyEntityToSql: {
    [K in keyof TEntity]: keyof TRow
  }
  mapKeySqlToEntity: {
    [K in keyof TRow]: keyof TEntity
  }
}
