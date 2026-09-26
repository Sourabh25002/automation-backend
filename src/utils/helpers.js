// Convert durations like '7d' or '15m' into milliseconds.
export const durationToMilliseconds = (value) => {
    const match = /^([1-9]\d*)([smhd])$/.exec(value ?? '');
    if (!match) {
        throw new Error('Duration must be a positive number followed by s, m, h, or d');
    }

    const unitMilliseconds = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    const milliseconds = Number(match[1]) * unitMilliseconds[match[2]];
    if (!Number.isSafeInteger(milliseconds)) {
        throw new Error('Duration is too large');
    }

    return milliseconds;
};
