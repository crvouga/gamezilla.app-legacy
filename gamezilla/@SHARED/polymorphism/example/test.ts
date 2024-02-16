import { area, perimeter } from "./shape"
import { Circle } from "./shape-circle"
import { Rect } from "./shape-rect"

const shapes = [Circle(5), Circle(10), Rect(5, 10), Rect(10, 20)]

for (const shape of shapes) {
  console.log(shape)
  console.log("Area:", area(shape))
  console.log("Perimeter:", perimeter(shape))
}
