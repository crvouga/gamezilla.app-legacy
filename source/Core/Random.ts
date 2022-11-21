// source: https://stackoverflow.com/questions/16801687/javascript-random-ordering-with-seed


export const mulberry32 = (a: number) => {
    return () => {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}



export const seededRandom = ({ rng }: { seed: string, rng: () => number }) => {

    const rnd = (lo: number, hi: number, defaultHi = 1) => {
        if (hi === undefined) {
            hi = lo === undefined ? defaultHi : lo;
            lo = 0;
        }

        return rng() * (hi - lo) + lo;
    };

    const rndInt = (lo: number, hi: number) => {
        return Math.floor(rnd(lo, hi, 2))
    };

    const shuffle = <T>(a: T[]) => {
        for (let i = a.length - 1; i > 0; i--) {
            const j = rndInt(i + 1, 2);
            const temp = a[i];
            a[i] = a[j]!;
            a[j] = temp!;
        }
    };

    return {
        rnd,
        rndInt,
        shuffle
    };
};
