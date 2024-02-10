import { Posix } from "../data"

export type Easing =
    | { type: "ease-out-bounce"; n1?: number; d1?: number }
    | { type: "ease-out-quint" }
    | { type: "linear" }
    | { type: "ease-in-back" }
    | { type: "ease-in-expo" }
    | { type: "ease-out-back" }

export type Model = {
    startMs: Posix
    durationMs: number
    value: number
    from: number
    to: number
    easing: Easing
    delayMs: number
}

const initConstant = (value: number): Model => {
    return {
        startMs: Posix.fromNumber(0),
        durationMs: 0,
        value,
        from: value,
        to: value,
        easing: { type: "linear" },
        delayMs: 0,
    }
}

function easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5)
}

function easeInBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return c3 * x * x * x - c1 * x * x
}

function easeInExpo(x: number): number {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
}

function easeOutBack(x: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

const ease = (easing: Easing, x: number): number => {
    switch (easing.type) {
        case "ease-out-back":
            return easeOutBack(x)

        case "ease-out-bounce":
            // return 1 - bounceIn(1 - x);
            return easeOutBounce(x)

        case "ease-out-quint":
            return easeOutQuint(x)

        case "ease-in-back":
            return easeInBack(x)

        case "ease-in-expo":
            return easeInExpo(x)

        case "linear":
            return x
    }
}

function easeOutBounce(x: number): number {
    const n1 = 7.5625
    const d1 = 2.75

    if (x < 1 / d1) {
        return n1 * x * x
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375
    }
}

const step = (now: Posix, model: Model): Model => {
    const elapsedMs = now - model.startMs
    if (elapsedMs < model.delayMs) {
        return model
    }
    const progress = (elapsedMs - model.delayMs) / model.durationMs
    if (progress >= 1) {
        return { ...model, value: model.to }
    }
    const range = Math.abs(model.to - model.from)
    const sign = Math.sign(model.to - model.from)
    const easedProgress = sign * ease(model.easing, progress)
    const valueNew = model.from + range * easedProgress
    return { ...model, value: valueNew }
}

const init = ({
    from,
    to,
    durationMs,
    startMs,
    delayMs = 0,
    easing = { type: "linear" },
}: {
    easing?: Easing
    delayMs?: number
    from: number
    to: number
    durationMs: number
    startMs: Posix
}): Model => {
    return {
        startMs,
        durationMs,
        value: from,
        from,
        to,
        easing,
        delayMs,
    }
}

export const Ease = {
    init,
    initConstant,
    step,
    ease,
}

type AttributeEaseConfig = {
    min?: number
    max?: number
    from: number
    to: number
    duration: number
    easing?: Easing
    delay?: number
}

/**
 *
 */
type Node = { setAttribute: (attribute: string, value: string) => void }

type Attributes = {
    [attribute: string]: AttributeEaseConfig
}
/**
 * Applies easing function-based animations to specified attributes of an HTML/SVG node.
 *
 * @param {Node} node - An object representing an HTML/SVG node with a `setAttribute` function.
 * @param {Attributes} attributes - An object mapping attribute names to their animation configurations.
 *
 * @example
 *   const node = document.querySelector('#myElement');
 *   const attributes = {
 *     'attribute1': { from: 0, to: 100, duration: 2000 },
 *     'attribute2': { from: 50, to: 0, duration: 1500, easing: { type: 'linear' }, delay: 500 },
 *   };
 *   easeAttrs(node, attributes);
 */
export const easeAttrs = async (
    node: Node,
    attributes: Attributes,
): Promise<void> => {
    const startTime = performance.now()
    const keys = Object.keys(attributes)
    const keyLength = keys.length
    let loop = false
    let i = 0
    let elapsed: number
    let progress: number
    let eased: number
    let clamped: number
    let c: AttributeEaseConfig

    return new Promise((resolve) => {
        function step(currentTime: number) {
            loop = false
            for (i = 0; i < keyLength; i++) {
                c = attributes[keys[i]!]!
                elapsed = currentTime - startTime - (c.delay || 0)
                progress = Math.max(0, Math.min(elapsed / c.duration, 1))
                eased =
                    c.from +
                    (c.to - c.from) *
                        ease(c.easing || { type: "linear" }, progress)
                clamped = Math.min(
                    c.max || Infinity,
                    Math.max(c.min || -Infinity, eased),
                )
                node.setAttribute(keys[i]!, String(clamped))
                loop = loop || progress < 1
            }

            if (loop) {
                requestAnimationFrame(step)
                return
            }

            resolve()
        }

        requestAnimationFrame(step)
    })
}
