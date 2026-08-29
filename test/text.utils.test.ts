import { padBoth } from '@utils';

/**
 * `padBoth()` — sof funksiya, DB ham app ham kerak emas.
 *
 * Diqqat qilinadigan joy: toq to'ldirishda ortiqcha belgi QAYSI tomonga tushadi
 * (`Math.floor` boshiga, qoldig'i oxiriga) va uzunlik satrdan kichik bo'lganda
 * funksiya satrni kesmaydi.
 */
describe('padBoth()', () => {
    describe('markazlash', () => {
        it('juft to‘ldirishni ikki tomonga teng taqsimlaydi', () => {
            expect(padBoth('ab', 6)).toBe('  ab  ');
        });

        it('toq to‘ldirishda ortiqcha belgini OXIRIGA qo‘yadi', () => {
            // total = 3 → boshiga 1, oxiriga 2
            expect(padBoth('ab', 5)).toBe(' ab  ');
        });

        it('bo‘sh satrni to‘liq to‘ldirish belgisi bilan to‘ldiradi', () => {
            expect(padBoth('', 4, '-')).toBe('----');
        });
    });

    describe('to‘ldirish belgisi', () => {
        it('char berilmasa probel ishlatadi', () => {
            expect(padBoth('x', 5)).toBe('  x  ');
        });

        it('berilgan char bilan to‘ldiradi', () => {
            // app.ts dagi haqiqiy chaqiruv shakli: `padBoth(' ENV: dev ', 33, '=')`
            const result = padBoth(' ENV: dev ', 33, '=');

            expect(result).toBe('===========' + ' ENV: dev ' + '============');
            expect(result).toHaveLength(33);
        });

        it('ko‘p belgili char bilan ham aniq uzunlikni saqlaydi', () => {
            const result = padBoth('ab', 8, 'xy');

            expect(result).toHaveLength(8);
            expect(result).toContain('ab');
        });

        it('bo‘sh char berilsa to‘ldira olmaydi va satrni o‘zgarishsiz qaytaradi', () => {
            // padStart/padEnd bo'sh pad-satr bilan hech nima qo'shmaydi —
            // natija so'ralgan uzunlikdan qisqa bo'lib qoladi.
            expect(padBoth('ab', 6, '')).toBe('ab');
        });
    });

    describe('chegaraviy uzunliklar', () => {
        it('length satr uzunligiga teng bo‘lsa satrni o‘zgartirmaydi', () => {
            expect(padBoth('hello', 5)).toBe('hello');
        });

        it('length satrdan kichik bo‘lsa satrni KESMAYDI', () => {
            expect(padBoth('hello', 2)).toBe('hello');
        });

        it('manfiy length da ham satrni o‘zgarishsiz qaytaradi', () => {
            expect(padBoth('hello', -10)).toBe('hello');
        });

        it('length nol bo‘lsa bo‘sh satr bo‘shligicha qoladi', () => {
            expect(padBoth('', 0)).toBe('');
        });
    });

    describe('uzunlik invarianti', () => {
        it.each([
            ['abc', 10],
            ['abcd', 9],
            ['a', 2],
            ['', 7],
            ['toolongstring', 3],
        ])('padBoth(%j, %i) uzunligi max(length, str.length) ga teng', (str, length) => {
            expect(padBoth(str, length, '*')).toHaveLength(Math.max(length, str.length));
        });
    });
});
