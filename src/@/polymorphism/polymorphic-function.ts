export const Polymorphic = <TFunction extends (variant: any, ...args: any[]) => any | (() => void)>() => {
  type Variant = Parameters<TFunction>[0]

  type RestParameters = Parameters<TFunction> extends [any, ...infer Rest] ? Rest : never
  type TOutput = ReturnType<TFunction>

  type Implementation<TVariant extends Variant, TImplOutput extends TOutput | Variant> = {
    predicate: (variant: Variant) => variant is TVariant
    implementation: (variant: TVariant, ...args: RestParameters) => TImplOutput
  }

  let handleNotImplemented: TFunction | undefined

  const implementations: Implementation<any, any>[] = []

  function run(variant: Variant, ...args: RestParameters): TOutput {
    for (const implementation of implementations) {
      if (implementation.predicate(variant)) {
        return implementation.implementation(variant, ...args) as TOutput
      }
    }

    if (!handleNotImplemented) {
      throw new Error('No implementation for variant')
    }

    const handled = handleNotImplemented(variant, ...args)

    return handled
  }

  run.impl = <TVariant extends Variant, TImplOutput extends TOutput | Variant>(
    predicate: (variant: Variant) => variant is TVariant,
    implementation: (variant: TVariant, ...args: RestParameters) => TImplOutput
  ) => {
    implementations.push({
      predicate,
      implementation
    })
  }

  run.implDefault = (implementation: TFunction) => {
    handleNotImplemented = implementation
  }

  return run
}
