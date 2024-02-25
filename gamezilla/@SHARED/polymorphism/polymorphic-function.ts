export const definePolymorphicFunction = <
  TFunction extends (dataType: any, ...args: any[]) => any,
>(
  handleNotImplemented: TFunction,
) => {
  type DataType = Parameters<TFunction>[0]
  type RestParameters = Parameters<TFunction> extends [any, ...infer Rest]
    ? Rest
    : never
  type TOutput = ReturnType<TFunction>

  type Implementation<
    TVariant extends DataType,
    TImplOutput extends TOutput | DataType,
  > = {
    predicate: (dataType: DataType) => dataType is TVariant
    implementation: (dataType: TVariant, ...args: RestParameters) => TImplOutput
  }

  const implementations: Implementation<any, any>[] = []

  function run(dataType: DataType, ...args: RestParameters): TOutput {
    for (const implementation of implementations) {
      if (implementation.predicate(dataType)) {
        return implementation.implementation(dataType, ...args) as TOutput
      }
    }
    return handleNotImplemented(dataType, ...args)
  }

  run.implement = <
    TVariant extends DataType,
    TImplOutput extends TOutput | DataType,
  >(
    predicate: (dataType: DataType) => dataType is TVariant,
    implementation: (
      dataType: TVariant,
      ...args: RestParameters
    ) => TImplOutput,
  ) => {
    implementations.push({ predicate, implementation })
  }

  return Object.assign(run, {
    implement: run.implement,
  }) as typeof run & {
    implement: <
      TVariant extends DataType,
      TImplOutput extends TOutput | DataType,
    >(
      predicate: (dataType: DataType) => dataType is TVariant,
      implementation: (
        dataType: TVariant,
        ...args: RestParameters
      ) => TImplOutput,
    ) => void
  }
}
