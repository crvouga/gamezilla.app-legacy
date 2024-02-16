//
//
//
//
//

type Implementation<TInput, TInputVariant extends TInput, TOutput> = {
  predicate: (input: TInput) => input is TInputVariant
  implementation: (input: TInputVariant) => TOutput
}

export const definePolymorphicFunction = <TInput, TOutput>(
  handleNotImplemented: (input: TInput) => TOutput,
) => {
  const implementations: Implementation<TInput, any, TOutput>[] = []

  function run(baseType: TInput) {
    for (const implementation of implementations) {
      if (implementation.predicate(baseType)) {
        return implementation.implementation(baseType)
      }
    }
    return handleNotImplemented(baseType)
  }

  run.implement = <TInputVariant extends TInput>(
    predicate: (input: TInput) => input is TInputVariant,
    implementation: (input: TInputVariant) => TOutput,
  ) => {
    implementations.push({
      predicate,
      implementation,
    })
  }

  return run
}
