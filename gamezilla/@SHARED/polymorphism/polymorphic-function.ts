//
//
//
//
//

export const definePolymorphicFunction = <TOutput>() => {
  // const _implementations: [{predicate: (...input: any[])}] => TOutput> = {}

  function run(..._input: any[]) {
    // const dispatchValue = dispatchFunction(...input)
    // const implementation = _implementations[dispatchValue]
    // if (!implementation) {
    //   throw new Error(`No implementation for ${dispatchValue}`)
    // }
    // return implementation(...input)
  }

  // run["_implementations"] = _implementations

  run.implement = (
    _predicate: (...input: any[]) => boolean,
    _implementation: (...input: any[]) => TOutput,
  ) => {
    //
  }

  return run
}
