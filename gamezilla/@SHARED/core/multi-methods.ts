//
//
//
//
//

export const defineMultiMethod = <TOutput>(
  dispatchFunction: (...input: any[]) => string,
) => {
  const _implementations: Record<string, (...input: any[]) => TOutput> = {}

  function run(...input: any[]): TOutput {
    const dispatchValue = dispatchFunction(...input)
    const implementation = _implementations[dispatchValue]

    if (!implementation) {
      throw new Error(`No implementation for ${dispatchValue}`)
    }

    return implementation(...input)
  }

  run["_implementations"] = _implementations

  return run
}

const implement = <TOutput>(
  multiMethod: ReturnType<typeof defineMultiMethod>,
  dispatchValue: string,
  implementation: (...input: any[]) => TOutput,
) => {
  multiMethod["_implementations"][dispatchValue] = implementation
}

//
//
//
//
//
//
//

const area = defineMultiMethod<number>((shape) => shape.Type)

const premieter = defineMultiMethod<number>((shape) => shape.Type)

//
//
//
//
//
//

export type Circle = {
  Type: "circle"
  radius: number
}

implement(
  area,
  "circle",
  (shape: Circle): number => Math.PI * shape.radius ** 2,
)

implement(premieter, "circle", (shape: Circle) => 2 * Math.PI * shape.radius)

//
//
//

export type Rect = {
  Type: "rect"
  width: number
  height: number
}

implement(area, "rect", (shape: Rect) => shape.width * shape.height)

//
//
//

export type Square = {
  Type: "square"
  side: number
}

implement(area, "square", (shape: Square) => shape.side ** 2)

//
//
//

const shapes: (Circle | Square | Rect)[] = [
  { Type: "circle", radius: 10 },
  { Type: "rect", width: 10, height: 20 },
  { Type: "square", side: 10 },
]

for (const shape of shapes) {
  area(shape)
}
