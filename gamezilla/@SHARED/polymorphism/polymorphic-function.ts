//
//
//
//
//

type Implementation<TBaseType, TType extends TBaseType, TOutput> = {
  predicate: (baseType: TBaseType) => baseType is TType
  implementation: (...input: any[]) => TOutput
}

export const definePolymorphicFunction = <TBaseType, TOutput>() => {
  const implementations: Implementation<TBaseType, TBaseType, TOutput>[] = []

  function run(baseType: TBaseType) {
    for (const implementation of implementations) {
      if (implementation.predicate(baseType)) {
        return implementation.implementation(baseType)
      }
    }
    throw new Error(`No implementation for ${baseType}`)
  }

  run.implement = <TType extends TBaseType>(
    predicate: (baseType: TBaseType) => baseType is TType,
    implementation: (type: TType) => TOutput,
  ) => {
    implementations.push({
      predicate,
      implementation,
    })
  }

  return run
}
