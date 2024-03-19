const { sqrt, exp, sin, cos } = Math;
export type Config = {
    stiffness?: number;
    damping?: number;
    mass?: number;
    decimals?: number;
    teleport?: boolean;
    initialSpeed?: number;
    from?: number;
};
export const toValue = (instance: Instance): number => {
    return instance.state.x0;
};
export function currentTime() {
    if (typeof window !== "undefined") {
        return performance.now();
    }
    else {
        return 0;
    }
}
export type Instance = {
    config: InstanceConfig;
    state: InstanceState;
};
export const initInstance = (target: number, config: Config = {}): Instance => {
    const { stiffness = 170, damping = 26, mass = 1, decimals = 2, teleport = false, } = config;
    const k = stiffness;
    const c = damping;
    const m = mass;
    const X = target;
    const instanceConfig = { X, k, c, m, teleport, decimals };
    const instanceState = getInitialState(target, config);
    return {
        config: instanceConfig,
        state: instanceState,
    };
};
function isMoving_(x: number, v: number, t: number, { decimals, X, k, c, m }: InstanceConfig) {
    if (roundTo(x, decimals) !== roundTo(X, decimals)) {
        return true;
    }
    const nextT = t + 0.016;
    const { x: nextX } = springStep({
        x0: x,
        v0: v,
        t0: t,
        t: nextT,
        k,
        c,
        m,
        X,
    });
    return roundTo(nextX, decimals) !== roundTo(X, decimals);
}
export const isMoving = (instance: Instance): boolean => {
    return isMoving_(instance.state.x0, instance.state.v0, instance.state.t0, instance.config);
};
export const stepInstance = (instance: Instance, t: number): Instance => {
    const { config, state } = instance;
    const { X, k, c, m, teleport, decimals } = config;
    const { x0, v0, t0 } = state;
    const { x, v } = springStep({ x0, v0, t0, t, k, c, m, X });
    const nextX = teleport ? X : roundTo(x, decimals);
    const nextV = roundTo(v, decimals);
    return {
        config,
        state: {
            x0: nextX,
            v0: nextV,
            t0: t,
        },
    };
};
function roundTo(x: number, decimals: number) {
    const p = Math.pow(10, decimals);
    return Math.round(x * p) / p;
}
export function getInitialState(target: number, { from, initialSpeed }: Config) {
    return {
        x0: from ?? target,
        v0: initialSpeed ?? 0,
        t0: currentTime(),
        raf: null,
    };
}
export type InstanceConfig = {
    X: number;
    k: number;
    c: number;
    m: number;
    teleport: boolean;
    decimals: number;
};
type InstanceState = {
    x0: number;
    v0: number;
    t0: number;
};
export function springStep({ x0, v0, t0, t, k, c, m, X }: Input): Output {
    const dx = x0 - X;
    const dt = (t - t0) / 1000;
    const radicand = c * c - 4 * k * m;
    if (radicand > 0) {
        const rp = (-c + sqrt(radicand)) / (2 * m);
        const rn = (-c - sqrt(radicand)) / (2 * m);
        const a = (dx * rp - v0) / (rp - rn);
        const b = (v0 - dx * rn) / (rp - rn);
        return {
            x: X + a * exp(rn * dt) + b * exp(rp * dt),
            v: a * rn * exp(rn * dt) + b * rp * exp(rp * dt),
        };
    }
    else if (radicand < 0) {
        const r = -c / (2 * m);
        const s = sqrt(-radicand) / (2 * m);
        const a = dx;
        const b = (v0 - r * dx) / s;
        return {
            x: X + exp(r * dt) * (a * cos(s * dt) + b * sin(s * dt)),
            v: exp(r * dt) *
                ((b * s + a * r) * cos(s * dt) - (a * s - b * r) * sin(s * dt)),
        };
    }
    else {
        const r = -c / (2 * m);
        const a = dx;
        const b = v0 - r * dx;
        return {
            x: X + (a + b * dt) * exp(r * dt),
            v: (b + a * r + b * r * dt) * exp(r * dt),
        };
    }
}
type Input = {
    x0: number;
    v0: number;
    t0: number;
    t: number;
    k: number;
    c: number;
    m: number;
    X: number;
};
type Output = {
    x: number;
    v: number;
};
