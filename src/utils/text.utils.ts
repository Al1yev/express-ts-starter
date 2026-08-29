export function padBoth(str: string, length: number, char: string = ' ') {
    const totalPadding = Math.max(length - str.length, 0);
    const startPadding = Math.floor(totalPadding / 2);
    return str.padStart(str.length + startPadding, char).padEnd(length, char);
}
